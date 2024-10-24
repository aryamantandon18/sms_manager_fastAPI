db.createCollection("country_operators", {
    validator: {
       $jsonSchema: {
          bsonType: "object",
          required: ["country", "operator", "is_high_priority"],
          properties: {
             country: {
                bsonType: "string",
                description: "must be a string and is required"
             },
             operator: {
                bsonType: "string",
                description: "must be a string and is required"
             },
             is_high_priority: {
                bsonType: "bool",
                description: "must be a boolean and is required"
             }
          }
       }
    }
 })

 db.createCollection("users", {
   validator: {
       $jsonSchema: {
           bsonType: "object",
           required: ["username", "email", "hashed_password"],
           properties: {
               username: {
                   bsonType: "string",
                   description: "must be a string and is required"
               },
               email: {
                   bsonType: "string",
                   description: "must be a string and is required"
               },
               full_name: {
                   bsonType: "string",
                   description: "must be a string if the field is present"
               },
               hashed_password: {
                   bsonType: "string",
                   description: "must be a string and is required"
               },
               disabled: {
                   bsonType: "bool",
                   description: "must be a boolean and is optional"
               }
           }
       }
   }
});
