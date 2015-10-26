var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;
var mongoose = require('mongoose');

var util = require('./util.js');
var config = require('./config.js').config;
var type_mapping = require('./type_mapping.js');

var Schema = mongoose.Schema;

var pool = new ConnectionPool(config.poolConfig, config.mssqlconfig);
var counter = 1;

mongoose.connect(config.mongodb);


pool.acquire(function(err, connection){
  if(err){
    console.error('POOL CONNECTION ERROR：' + err);
  }
  var m_schema, schema = {}, Model;
  
  //发出T-SQL
  var request = new Request("SELECT * FROM cdc.fn_cdc_get_all_changes_dbo_aaaaaabbbbbb(sys.fn_cdc_get_min_lsn('dbo_aaaaaabbbbbb'), sys.fn_cdc_get_max_lsn(), N'all')", function(err, rowCount){
    if(err){
      console.error('REQUEST INIT ERROR：' + err);
    }
    
    console.log('REQUETS INFO: ' + rowCount);
    
    connection.release();
  });
  
  request.on("columnMetadata", function (columns) {
    console.log(columns);
      columns.forEach(function (item) {
          schema[item.colName] = type_mapping[item.type.name];
      });

      m_schema = new Schema(schema);

      if (mongoose.modelNames().indexOf(rule.mongodb_table) === -1) {
          Model = mongoose.model(rule.mongodb_table, m_schema);
      } else {
          Model = mongoose.model(rule.mongodb_table);
      }

  });
  
  request.on('row', function(columns){
    console.log('REQUEST LISTEN ROW DATA: ' + columns);
  });
  
  connection.execSql(request);
  
});

pool.on('error', function(err){
  console.log('POOL RUN ERROR: ' + err);
});
// config.rules.forEach(function (rule) {
//     pool.requestConnection(function (err, connection) {
//         if (!err) {
//             var query = util.build_cbc_query(rule);
//             var m_schema, schema = {}, Model;
            
//             request = new Request(query, function (err, rowCount) {
//                 connection.close();
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     console.log(rowCount + ' rows');
//                 }
//             });

//             request.on("columnMetadata", function (columns) {
//               console.log(columns);
//                 // columns.forEach(function (item) {
//                 //     schema[item.colName] = type_mapping[item.type.name];
//                 // });

//                 // m_schema = new Schema(schema);

//                 // if (mongoose.modelNames().indexOf(rule.mongodb_table) === -1) {
//                 //     Model = mongoose.model(rule.mongodb_table, m_schema);
//                 // } else {
//                 //     Model = mongoose.model(rule.mongodb_table);
//                 // }

//             });

//             request.on('row', function (columns) {
//               console.log(columns);
//                 // var model = new Model();

//                 // columns.forEach(function (column) {
//                 //     if (schema.hasOwnProperty(column.metadata.colName)) {
//                 //         model[column.metadata.colName] = column.value;
//                 //     }
//                 // });

//                 // model.save(function (err) {
//                 //     if (err) {
//                 //         console.log(err)
//                 //     } else {
//                 //         console.log(counter++);
//                 //     }
//                 // });
//             });

//             connection.on('connect', function (err) {
//                 connection.execSql(request);
//             })
//         }
//     });
// });