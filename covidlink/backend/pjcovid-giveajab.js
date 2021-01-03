// Include the AWS SDK module
const AWS = require('aws-sdk');
// Instantiate a DynamoDB document client with the SDK
let dynamodb = new AWS.DynamoDB.DocumentClient();
// Use built-in module to get current date & time

// Store date and time in human-readable format in a variable

var json_return_array;
var vials_return_array;

class response_obj {
  constructor(statuscode, body) {
    this.statusCode = statuscode;
    this.body = body;
  }
}

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
        UpdateExpression: 'add thisvial :increment, thiscubicle :increment',
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

      return new response_obj(200, { overview: json_return_array,
                                     vial: vials_return_array});
    }

    else if (event.operation == 'removejab')
    {
      var cubicle = event.cubicle;
      var timestamp = event.timestamp;

      console.log("remove jab: t:"+timestamp+"from c:"+cubicle);

      var removeparams = {
        TableName: "text-pjcovid-vaccines",
        Key: {  "cubicle": cubicle,
                "timestamp": timestamp }
      };



      // subtract thiscubicle by 1
      var vialdecrement = {
        TableName:'pjcovid-vials',
        Key: {
          "cubicle":cubicle
        },
        UpdateExpression: 'subtract thisvial :increment, thiscubicle :increment',
        ExpressionAttributeValues: {
          ":increment": 1
          },
        ReturnValues: 'ALL_NEW'
      };

      try {
        let r = await dynamodb.delete(removeparams).promise();
      // delete last item
        console.log("delete return:"+r);
        let vialdata = await dynamodb.update(vialdecrement).promise();
        let data = await dynamodb.query(readparams).promise();

        json_return_array = JSON.stringify(data.Items);
        vials_return_array = JSON.stringify(vialdata.Items);


    } catch (err) { console.log(err) }
        return new response_obj(200, { overview: json_return_array,
                                       vial: vials_return_array
                                     });

    }

    else if (event.operation == 'gpoverview')
    {

      console.log("GP Lead screen");
      // need to return array containing number of vaccines for each cubicle (passed number of cubicles)

      let cubicle_count = event.cubicle_count;

      //scan table then local function to return into array
      // select count
      var scanparams = {
            TableName : "pjcovid-vials",
            FilterExpression : "cubicle <= :cubicle_count",
            ExpressionAttributeValues : { ":cubicle_count": cubicle_count }
          };

          // TODO? limit time between scans? have global variable updated every x seconds?
      try {

            var data = await dynamodb.scan(scanparams).promise();
            var scanneditems = JSON.stringify(data.Items);

      } catch (err) {
          console.log("error:"+err);
      }

      console.log("Scanned items:"+scanneditems);

      /*var scanresponse = {
        statusCode: 200,
        body: scanneditems
      };*/

      return new response_obj(200,scanneditems);

      //return scanresponse;

    }

    else if (event.operation == 'pharmaoverview')
    {
      console.log("Pharma overview");
    }

    else if (event.operation == 'newvial')
    {
      var nvcubicle = event.cubicle;
      var doses = event.vialdoses;
      console.log("new vial for:"+nvcubicle+"with doses:"+doses);
      // reset cubicle counter to number

    }
};
