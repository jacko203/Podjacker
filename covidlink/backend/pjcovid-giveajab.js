// Include the AWS SDK module
const AWS = require('aws-sdk');
// Instantiate a DynamoDB document client with the SDK
let dynamodb = new AWS.DynamoDB.DocumentClient();

var json_return_array;
var vials_return_array;

var live_data = {};

class response_obj {
  constructor(statuscode, body) {
    this.statusCode = statuscode;
    this.body = body;
  }
}

exports.handler = async (event) => {

    console.log("API invoked");

    var key = event.data;

    switch (key.operation)
    {
      case "dovaccinate": return pjc_vaccinate(key.cubicle);
      case "removejab": return pjc_removejab(key.cubicle, key.timestamp);
      case "newvial": return pjc_newvial(key.cubicle, key.vialdoses);
      case "gpoverview": return pjc_gpoverview(key.cubicle_count);
      default: return new response_obj(400,JSON.stringify("No event operation"));
    }

};


async function pjc_gpoverview(cubicle_count) {

      console.log("GP Lead screen: "+cubicle_count);
      var int_cubicle_count = parseInt(cubicle_count);

      //scan table then local function to return into array
      var scanparams = {
            TableName : "pjcovid-vials",
            FilterExpression : "cubicle <= :cubicle_count",
            ExpressionAttributeValues : { ":cubicle_count": int_cubicle_count }
          };


      var timer = new Date();

      console.log("determining time elapsed. timer="+timer+"live_data:"+live_data.time);

      if (live_data.time < timer || live_data.time === undefined) {

        console.log("New scan event");

        try {

            var scan_data = await dynamodb.scan(scanparams).promise();
            live_data.vars = JSON.stringify(scan_data.Items);

          } catch (err) {
            console.log("error:"+err);
          }

          console.log("New vars:"+live_data.vars);

          //add 5 seconds to when will next allow fetch
          live_data.time = timer.setSeconds( timer.getSeconds()+5 );

        }
      else {
          console.log("using existing data rather than rescanning");
        }

      console.log("Scanned items:"+live_data.vars);

      return new response_obj(200,live_data.vars);
}


/*
    else if (event.operation == 'pharmaoverview')
    {
      console.log("Pharma overview");
    }
  } */




async function pjc_vaccinate(cubicle) {

  console.log("in do-vaccinate");

  let date = new Date();
  let now = date.toISOString();
  var int_cubicle = parseInt(cubicle);

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

async function pjc_removejab(cubicle, timestamp) {

    console.log("remove jab: t:"+timestamp+"from c:"+cubicle);

    // remove timestamp/dose
    var removeparams = {
      TableName: "text-pjcovid-vaccines",
      Key: {  "cubicle": cubicle,
              "timestamp": timestamp },
      ReturnValues: "ALL_OLD"  //returns empty if nothing deleted
    };

    // subtract thiscubicle by 1
    var vialdecrement = {
      TableName:'pjcovid-vials',
      Key: {
        "cubicle":cubicle
      },
      UpdateExpression: 'add thisvial :increment, thiscubicle :increment',
      ExpressionAttributeValues: {
        ":increment": -1
        },
      ReturnValues: 'ALL_NEW'
    };

    var readparams = {
          TableName : "text-pjcovid-vaccines",
          KeyConditionExpression: "cubicle = :cubval",
          ExpressionAttributeValues: {
              ":cubval": cubicle
              }
            };

    try {
      let r = await dynamodb.delete(removeparams).promise();
    // delete last item
      console.log("delete return:"+r);

      var vialdata = await dynamodb.update(vialdecrement).promise();
        if(vialdata==null) throw new Error("null return delete");

      vials_return_array = JSON.stringify(vialdata);

      var data = await dynamodb.query(readparams).promise();
      json_return_array = JSON.stringify(data.Items);

  } catch (err) { console.log(err) }


      return new response_obj(200, { overview: json_return_array,
                                     vial: vials_return_array
                                   });
}

async function pjc_newvial(nvcubicle, doses) {

    console.log("new vial for:"+nvcubicle+"with doses:"+doses);
    // reset cubicle counter to number

    var vialset = {
      TableName:'pjcovid-vials',
      Key: {
        "cubicle":nvcubicle
      },
      UpdateExpression: 'set thisvial :base, pervial :pervial',
      ExpressionAttributeValues: {
        ":base": 0,
        ":pervial": doses
        },
      ReturnValues: 'ALL_NEW'
    };

    let nvdata = await dynamodb.update(vialset).promise();
    vials_return_array = JSON.stringify(nvdata);

    return new response_obj(200, { vial: vials_return_array });
  }
