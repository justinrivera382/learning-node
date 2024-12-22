// the entire point was to make this more "generic" so it can be utilized in more than one file
// NOTE that the "populate" parameter is "what fields" we want displayed
// by using this middleware, we are enriching the the request-response object to carry the data over to the next step and now we have access to the "res.advancedResults" object in our "controllers" directory
const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // copy req.query
  // The reason why we copy "req.query" into "reqQuery" is so we can use reqQuery to check specifically for the regexPattern we set up. And then we can use the "req.query" to check for things like the select, sort, etc... in an if-statement
  // I was originally confused but now I get it thanks to console logging everything and checking
  const reqQuery = { ...req.query };

  // console.log(reqQuery);
  // Fields to exclude of words we DO NOT want to match
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // console.log("after");
  // console.log(reqQuery);

  // the /g means "global", for when you want to find all matches (not just the first)
  const regexPattern = /\b(gt|gte|lt|lte|in)\b/g;

  // we need to stringify the "req.query" to do the pattern matching when we're looking for "greater than/equal to", "less than/equal to", and "in" when looking into an array
  // create query string
  let queryStr = JSON.stringify(reqQuery);

  // this is where the magic occurs, in the first parameter we are using the "regexPattern" to find a specific pattern and once the first pattern is found we then use the second parameter to take the discovered "regexPattern" and append "$" to the start. this is needed because it's the specific pattern syntax required for MONGODB
  // reference docs: https://www.mongodb.com/docs/manual/reference/operator/query/gt/
  // using the reference docs, you'll see the specific pattern I'm referencing is the object { field: { $gt: value } } where you can see "$gt" for the key and is the pattern we're trying to create here
  // Create operators ($gt, $gte, etc...)
  queryStr = queryStr.replace(regexPattern, (match) => `$${match}`);

  // Finding resource
  // this is where we start "building our query", in the if-statements with req.query.select, req.query.sort, etc... they will continue building the rest of the query
  // we are going to "reverse populate"
  // Note if you wanted to "limit" the data in the, this case, "virtual courses" field. all you would need to do is .populate({ path: "courses", select: "title description etc..."})
  query = model.find(JSON.parse(queryStr));
  // console.log(queryStr);

  // console.log("checking req.query");
  // console.log(req.query);
  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    // console.log(fields);
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    // console.log(sortBy)
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  // remember that when we receive data the keys aren't strings and the values always come in as numbers. so if you need to do anything with them as a certain other data type remember to switch them. like we do with parseInt() here
  // parseInt(string, radix). think of it like google translate. the first parameter is "hola" and the second parameter is "spanish" and it will interpret it as such. so with parseInt() it's like putting 69 and 10 (meaning decimal base 10, aka our standard counting numbers people use which works here because we want to use these number as "page numbers" for users to click on)
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const results = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  // remember we have access to request and response
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
