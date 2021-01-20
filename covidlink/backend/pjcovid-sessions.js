// Include the AWS SDK module
const AWS = require('aws-sdk');
// Instantiate a DynamoDB document client with the SDK
let dynamodb = new AWS.DynamoDB.DocumentClient();


const vials_table = "vials-table";
const vac_table = "text-pjcovid-vaccines";
const sess_table = "pjcovid-sessions";
const app_table = "pjcovid-appdata";
const pj_dropid = "drop1";

//module.exports = {
//  pjc_getsession: pjc_getsession,
//  pjc_setsession: pjc_setsession
//};


var sess_return_array = [];

class response_obj {
  constructor(statuscode, body) {
    this.statusCode = statuscode;
    this.bodya = body;
  }
}

//pjc_amend_DNAs - add to session x
module.exports.pjc_amend_DNAs = async (sessionID,increment) => {

   var int_increment = parseInt(increment,0);
   //var int_session = parseInt(sessionID,0);
  console.log("amending: DNAs with increment:"+int_increment+"; session:"+sessionID);

 // var sessionIDnow = module.exports.pjc_getsession();

  var sessupdate = {
    TableName:`${sess_table}`,
    Key: {
      "sessionID":sessionID
    },
    UpdateExpression: `set DNAs = DNAs + :increment`,
    ExpressionAttributeValues: {
      ":increment" : int_increment
      },
    ReturnValues: 'ALL_NEW'
  };

  let sessdata = await dynamodb.update(sessupdate).promise();
  sess_return_array = JSON.stringify(sessdata);

  return new response_obj(200, { sessions: sess_return_array });

  //return pjc_amend_sitem(sessionID,"DNAs",increment);
};

//pjc_amend_extras - add to session x
module.exports.pjc_amend_extras = async (sessionID,increment) =>  {
   var int_increment = parseInt(increment,0);

  // var int_session = parseInt(sessionID,0);

  console.log("amending:extras with increment:"+int_increment);

  //var sessionIDnow = module.exports.pjc_getsession();
  //var sessionIDnow = "day1am";



  var sessupdate = {
    TableName:`${sess_table}`,
    Key: {
      "sessionID":sessionID
    },
    UpdateExpression: `set extras = extras + :increment`,
    ExpressionAttributeValues: {
      ":increment" : int_increment
      },
    ReturnValues: 'ALL_NEW'
  };

  let sessdata = await dynamodb.update(sessupdate).promise();
  sess_return_array = JSON.stringify(sessdata);

  return new response_obj(200, { sessions: sess_return_array });


  //return pjc_amend_sitem(sessionID,"extras",increment);
};


/*const pjc_amend_sitem = async (sessionID, item, increment) => {
  var int_increment = parseInt(increment,0);
  console.log("amending:"+item+" with increment:"+int_increment);

  //var sessionIDnow = module.exports.pjc_getsession();
  var sessionIDnow = "day1am";

  var sessupdate = {
    TableName:`${sess_table}`,
    Key: {
      "pjcsession":sessionIDnow
    },
    UpdateExpression: `set DNAs = DNAs + :increment`,
    ExpressionAttributeValues: {
      ":increment" : int_increment
      },
    ReturnValues: 'ALL_NEW'
  };

  let sessdata = await dynamodb.update(sessupdate).promise();
  sess_return_array = JSON.stringify(sessdata);

  return new response_obj(200, { sessions: sess_return_array });
};*/




// pjc_setsession - set the current session id
module.exports.pjc_setsession = async (sessionID) => {
   var sess = {
    TableName:`${app_table}`,
    Key: {
      "dropid":1
    },
    UpdateExpression: `set session = :session`,
    ExpressionAttributeValues: {
      ":session" : sessionID
      },
    ReturnValues: 'ALL_NEW'
  };

  let sessdata = await dynamodb.update(sess).promise();
  sess_return_array = JSON.stringify(sessdata);

  return new response_obj(200,{cur_sess:sess_return_array});
};


// pjc_getsession - return the current session id

module.exports.pjc_getsession = async () => {

    console.log("in get session")

    var sessq = {
      TableName: `${app_table}`,
      KeyConditionExpression: "dropid = :drop",
      ExpressionAttributeValues: {
      ":drop" : pj_dropid
      }
    };

    let sessdata = await dynamodb.query(sessq).promise();

    sess_return_array = JSON.stringify(sessdata);
    //var sessID = sess_return_array;

    return new response_obj(200,sess_return_array);
};

// this should be overall so in cubicles
//const pjc_adjustunusable = async (increment) => {
//  console.log("adjusting unusable")
//};

module.exports.pjc_returnsessiondata = async (sessionID,booked) => {
//pjc_returnsessiondata - return all session data

  console.log("returning session data"+sessionID+"booked:"+booked);

  if (booked != -1)
  {
    var setbooked = {
      TableName: `${sess_table}`,
      Key: {"sessionID":sessionID},
      UpdateExpression: "set booked = :booked",
      ExpressionAttributeValues: {
      ":booked" : booked
    },
    ReturnValues: 'ALL_NEW'
    };

    let bookedr = await dynamodb.update(setbooked).promise();
  }

    var sessd = {
      TableName: `${sess_table}`,
      KeyConditionExpression: "sessionID = :pjcsession",
      ExpressionAttributeValues: {
      ":pjcsession" : sessionID
      }
    };

    let sessdata = await dynamodb.query(sessd).promise();

    sess_return_array = JSON.stringify(sessdata);
    return new response_obj(200,sess_return_array);

};







/*
export async function pjc_setsessiondata(session) {

    console.log("setting session data:"+session);
    // reset cubicle counter to number

    /*
    Table design - pjcovid-sessions

    session - number
    descript - description
    bookings - number of patients
    delivered - vaccines delivered
    Unusable - wasted
    dnas - did not attend
    extras - user writable number to show number of extra patients vaccd

    Table design - appdata
    sess_number - session number
    sess_descript - plaintext description
    vialstotal - total number of vials deployed




    var int_bookings = parseInt(session.bookings,0);



    var sessset = {
      TableName:`${sess_table}`,
      Key: {
        "session":int_session
      },
      UpdateExpression: 'set bookings = :bookings, delivered = :zerodoses',
      ExpressionAttributeValues: {
        ":bookings": int_bookings,
        ":zerodoses":0
        },
      ReturnValues: 'ALL_NEW'
    };

    let sessdata = await dynamodb.update(sessset).promise();
    sess_return_array = JSON.stringify(sessdata);

    return new response_obj(200, { vial: sess_return_array });
  }


  async function pjc_addextra(session) {

    console.log("adding extra, session no:"+session.sess_number);

    var sess = {
          TableName: `${sess_table}`,
          UpdateExpression: "set extras = extras + :increment",
          ExpressionAttributeValues: {
            ":increment", 1
          },
          ReturnValues: 'ALL_NEW'
        };



  }


    let sessdata = await dynamodb.put(sess).promise();
    sess_return_array = JSON.stringify(sessdata.Items);

    return new response_obj(200, { sess_return_array. });
  }


  async function pjc_getsessiondata(session) {

  var int_session = parseInt(session.sess_number,0);

  var sessget = {
    TableName:`${sess_table}`,
    KeyConditionExpression: {
      "session = :int_session"
    },
    ExpressionAttributeValues: {
      ":int_session": int_session
    };

    let sessdata = await dynamodb.query(sessset).promise();

  sess_return_array = JSON.stringify(sessdata);

  return new response_obj(200, { vial: sess_return_array });


}
*/
