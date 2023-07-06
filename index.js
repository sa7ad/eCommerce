const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/eCommerce");

const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");

const nocache = require("nocache");
const session = require("express-session");
const logger = require("morgan");
const express = require("express");
const app = express();
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
app.use(logger("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/userAssets"));
app.use(express.static(__dirname + "/public/adminAssets"));
app.use(nocache());
app.use(
  session({
    secret: "key",
    saveUninitialized: true,
    resave: false,
  })
);

const PORT = 3000;

const options = {
  definition: {
    openapi: "3.0.3",
    info:{
      title:"E-Commerce API",
      version:"0.1.0",
      description:"This is an api based on an ecommerce website",
      contact:{
        name:"Ecommerce",
      }
    },
    servers: [
      {
        url: "http://localhost:3000/",
      },
    ],
  },
  apis: ["./routes/*.js"],
};
const swag = swaggerJsDoc(options);

//User Routes
app.use("/", userRoute);
//Admin Routes
app.use("/admin", adminRoute);
//Open API Route
app.use("/apiDocs", swaggerUi.serve, swaggerUi.setup(swag));
//Error Route
app.use((req, res) => {
  res.status(404).render("error404");
});

app.listen(PORT, () => {
  console.log("Server is running on PORT http://localhost:3000");
});
