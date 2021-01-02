// Include the AWS SDK module
const AWS = require('aws-sdk');
// Instantiate a DynamoDB document client with the SDK
let dynamodb = new AWS.DynamoDB.DocumentClient();
// Use built-in module to get current date & time

// Store date and time in human-readable format in a variable

var testreturn = 0;
var json_return_array;
var vials_return_array;

exports.handler = async (event) => {

    //make this better
    if(event.operation == "dovaccinate")
    {
      console.log("in do-vaccinate");

      let date = new Date();
      let now = date.toISOString();
      var int_cubicle = event.cubicle;

      let params = {
        TableName:'text-pjcovid-vaccines',
        Item: {
            'cubicle': int_cubicle,
            'timestamp': now
        }
      };

      var vialincrement = {
        TableName:'pjcovid-vials',
        Key: {
          "cubicle":int_cubicle
        },
        UpdateExpression: 'add thisvial :increment',
        ExpressionAttributeValues: {
          ":increment": 1
          },
        ReturnValues: 'ALL_NEW'
      };

    // Using await, make sure object writes to DynamoDB table before continuing execution
    console.log("Putting item:" +int_cubicle);

    //var docClient = new AWS.DynamoDB.DocumentClient();

    var readparams = {
          TableName : "text-pjcovid-vaccines",
          KeyConditionExpression: "cubicle = :cubval",
          ExpressionAttributeValues: {
              ":cubval": int_cubicle
              }
            };

    console.log("Getting item:"+int_cubicle);

    try {

          await dynamodb.put(params).promise();
          console.log("put promise resolved");
        // Now query for all from this cubicle
          let data = await dynamodb.query(readparams).promise();

          console.log("about to create return array");
          json_return_array = JSON.stringify(data.Items);

          let vials_back = await dynamodb.update(vialincrement).promise();
          if (vials_back == null) { console.log("null return from vials");
              }
          else {
            vials_return_array = JSON.stringify(vials_back);
            console.log("Vials return"+vials_return_array);
          }


        } catch (err) { console.log(err) }

    console.log("Returning");

      var response = {
        statusCode: 200,
        body: json_return_array
      }

      return response;
    }

    else if (event.operation == 'removejab')
    {
      console.log("remove jab");
    }

    else if (event.operation == 'gpoverview')
    {
      console.log("GP Lead screen");
    }

    else if (event.operation == 'pharmaoverview')
    {
      console.log("Pharma overview");
    }

    else if (event.operation == 'newvial')
    {
      var cubicle = event.cubicle;
      var doses = event.vialdoses;
      console.log("new vial for:"+cubicle+"with doses:"+doses);
      // reset cubicle counter to number

    }
};
