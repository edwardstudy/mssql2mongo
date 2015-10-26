var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;
var mongoose = require('mongoose');

var config = require('./config.js').config;
var type_mapping = require('./type_mapping.js');

var Schema = mongoose.Schema;

var pool = new ConnectionPool(config.poolConfig, config.mssqlconfig);
var counter = 1;

mongoose.connect(config.mongodb);

var mongoCollection = 'dbo.aaaaaabbbbbb';

pool.acquire(function(err, connection){
  if(err){
    console.error('POOL CONNECTION ERROR：' + err);
  }
  //type map schema
  var typeSchema = {};
  
  //mongoose schem and amodel
  var m_schema, Model;
  
  //send T-SQL request
  var request = new Request("SELECT * FROM cdc.dbo_aaaaaabbbbbb_CT", function(err, rowCount){
    if(err){
      console.error('REQUEST INIT ERROR：' + err);
    }
    
    console.log('REQUETS INFO: ' + rowCount);
    
    connection.release();
  });
  
  //fetch metadata to create mongoose model
  request.on("columnMetadata", function (columns){
    columns.forEach(function (item) {
      if(item.colName.indexOf('__$') === -1){
          typeSchema[item.colName] = type_mapping[item.type.name];         
      }

    });

    m_schema = new Schema(typeSchema);

    if(mongoose.modelNames().indexOf(mongoCollection) === -1){
      Model = mongoose.model(mongoCollection, m_schema);
    }else{
      Model = mongoose.model(mongoCollection);
    }

  });
  
  request.on('row', function(columns){
    var model = new Model();

    columns.forEach(function (column){
      if(typeSchema.hasOwnProperty(column.metadata.colName)){
        model[column.metadata.colName] = column.value;
      }
    });

    model.save(function (err){
      if(err){
        console.log(err);
      }else{
        console.log(counter++);
      }
    });    
  });
  
  connection.execSql(request);
  
});

pool.on('error', function(err){
  console.log('POOL RUN ERROR: ' + err);
});