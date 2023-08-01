require("dotenv").config();
const dbConnect = require("./controllers/dbController");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const cartCount = require("./middleware/cartCount");

const nocache = require("nocache");
const session = require("express-session");
const logger = require("morgan");
const express = require("express");
const app = express();
dbConnect();
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const ErrorHandler = require("./middleware/errorHandler");
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
    secret: process.env.SESSIONSECRET,
    saveUninitialized: true,
    resave: false,
  })
);

app.use(cartCount);

const PORT = 1000;

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "E-Commerce API",
      version: "0.1.0",
      description: "This is an api based on an ecommerce website",
      contact: {
        name: "Ecommerce",
      },
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

app.use("/", userRoute);

app.use("/admin", adminRoute);

app.use("/apiDocs", swaggerUi.serve, swaggerUi.setup(swag));

app.use((req, res) => {
  res.status(404).render("error404");
});

app.use(ErrorHandler);

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server is running on PORT http://localhost:${PORT}`);
});
