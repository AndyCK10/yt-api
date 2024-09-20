const express = require("express");
// const mysql = require("mysql2");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const { swaggerSpec, swaggerUi } = require("./swagger");

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.json());
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   port: process.env.DB_PORT,
// });

let conn = null;
const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  });
};

// db.connect((err) => {
//   if (err) {
//     throw err;
//   }
//   console.log("Connected to database");
// });

/**
 * @swagger
 * /:
 *  get:
 *      summary: Retrieve a list of videos.
 *      responses:
 *          '200':
 *              descriItion: A JSON array of videos.
 */
app.get("/", async (req, res) => {
  //   res.send("Hello andy");
  const query = `SELECT vl.video_id, vl.video_title, vl.video_url, vl.video_thumbnail, vl.video_created_at, c.channel_id,c.channel_name,c.channel_profile_picture, p.view_count 
  FROM videos_long vl 
  JOIN channels c ON vl.channel_id = c.channel_id 
  JOIN popular p ON vl.video_id = p.video_id;`;
  try {
    //     db.query(query, (err, result) => {
    //       if (err) {
    //         throw err;
    //       }
    //       res.send(result);
    //     });
    const [results] = await conn.query(query);
    res.send(results);
    // res.json(results);
  } catch (error) {
    console.log("error");
    // res.status(500).json({ error });
    res.status(500).send("เกิดข้อผิดพลาดในการดึงข้อมูล");
  }
});

/**
 * @swagger
 * /short:
 *  get:
 *      summary: Retrieve a list of videos.
 *      responses:
 *          '200':
 *              descriItion: A JSON array of videos.
 */
app.get("/short", async (req, res) => {
  //   res.send("Hello andy");
  const query = `SELECT vl.video_id, vl.video_title, vl.video_url, vl.video_thumbnail, vl.video_created_at, c.channel_id,c.channel_name,c.channel_profile_picture, p.view_count 
  FROM videos_short vl 
  JOIN channels c ON vl.channel_id = c.channel_id 
  JOIN popular p ON vl.video_id = p.video_id;`;
  try {
    //     db.query(query, (err, result) => {
    //       if (err) {
    //         throw err;
    //       }
    //       res.send(result);
    //     });
    const [results] = await conn.query(query);
    res.send(results);
    // res.json(results);
  } catch (error) {
    console.log("error");
    // res.status(500).json({ error });
    res.status(500).send("เกิดข้อผิดพลาดในการดึงข้อมูล");
  }
});

/**
 * @swagger
 * /users:
 *  get:
 *      summary: Retrieve a list of users.
 *      responses:
 *          '200':
 *              description: A JSON array of users.
 */
app.get("/users", async (req, res) => {
  const [results] = await conn.query("SELECT * FROM `users`");
  // console.log(results);
  // res.json(results)
  res.send(results);
});

/**
 * @swagger
 * /subscribe:
 *  get:
 *      summary: Retrieve a list of subscribes.
 *      responses:
 *          '200':
 *              description: A JSON array of users.
 */
app.get('/subscribe', async (req, res) => {
    const user_id = req.query.user_id
    if (!user_id) {
        res.status(400).send('กรุณาระบุ user_id')
    }

    const query = `
    SELECT vl.video_id, vl.video_title, vl.video_created_at, vl.video_thumbnail, c.channel_name, c.channel_profile_picture, p.view_count 
    FROM videos_long vl 
    JOIN channels c ON vl.channel_id = c.channel_id 
    JOIN popular p ON vl.video_id = p.video_id
    WHERE vl.video_title LIKE ? OR c.channel_name LIKE ?;
    `;

    try {
        const [result] = await conn.query(query, [
          `%${user_id}%`,
          `%${user_id}%`,
        ]);
        res.json(result);
      } catch (error) {
        res.status(500).send("เกิดข้อผิดพลาดในการดึงข้อมูล");
      }
})

/**
 * @swagger
 * /result:
 *  get:
 *      summary: Search for videos based on a query.
 *      parameters:
 *        - name: search_query
 *          in: query
 *          required: true
 *          description: The search query.
 *          schema:
 *              type: string
 *      responses:
 *          '200':
 *              description: A JSON array of videos.
 */
app.get("/result", async (req, res) => {
  const { search_query } = req.query;
  const query = `
    SELECT vl.video_id, vl.video_title, vl.video_created_at, vl.video_thumbnail, vl.video_description, c.channel_name, c.channel_profile_picture, p.view_count 
    FROM videos_long vl 
    JOIN channels c ON vl.channel_id = c.channel_id 
    JOIN popular p ON vl.video_id = p.video_id
    WHERE vl.video_title LIKE ? OR c.channel_name LIKE ?;
    `;
  try {
    const [result] = await conn.query(query, [
      `%${search_query}%`,
      `%${search_query}%`,
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).send("เกิดข้อผิดพลาดในการดึงข้อมูล");
  }
});

/**
 * @swagger
 * /watch:
 *  get:
 *      summary: Retrieve details of a specific video.
 *      parameters:
 *        - name: v
 *          in: query
 *          required: true
 *          description: The video ID.
 *          schema:
 *              type: string
 *      responses:
 *          '200':
 *              description: A JSON array containing details of the videos.
 */
app.get("/watch", async (req, res) => {
  console.log(req.query);
  const { v } = req.query;
  if (!v) {
    res.status(400).send("Invalid video parameter");
    return;
  }
  const query = `SELECT
    vl.video_id,
    vl.video_title,
    vl.video_description,
    vl.video_duration,
    vl.video_thumbnail,
    vl.video_url,
    vl.video_created_at,
    c.channel_name,
    c.channel_profile_picture,
    p.view_count,
    p.like_count,
    (SELECT COUNT(*) FROM channel_subscribe WHERE channel_id = vl.channel_id AND user_id = ?) AS is_subscribed,
    (
        SELECT GROUP_CONCAT(CONCAT(u.user_name, ': ', cm.comment_text) ORDER BY cm.comment_created_at SEPARATOR '\n')
        FROM comments cm
        JOIN users u ON cm.user_id = u.user_id
        WHERE cm.video_id = vl.video_id
    ) AS comments
    FROM videos_long vl
    JOIN channels c ON vl.channel_id = c.channel_id
    JOIN popular p ON vl.video_id = p.video_id
    WHERE vl.video_id = ?;
    `;
  try {
    const [results] = await conn.query(query, [v, v], (err, result) => {
      //   const video = result[0];
      //   const comments = video.comments.split("\n").map((comment) => {
      //     const [username, content] = comment.split(": ");
      //     return { [username]: { content } };
      //   });
      //   video.comments = comments;
      //   return [video];
    });
    //     res.json(results);
    const video = results[0];
    console.log(video.comments);

    const comments = video.comments.split("\n").map((comment) => {
      const [username, content] = comment.split(": ");
      return { [username]: { content } };
    });
    console.log(comments);
    video.comments = comments;
    res.json([video]);
  } catch (error) {
    res.status(500).send("เกิดข้อผิดพลาดในการดึงข้อมูล");
  }
});

app.listen(port, async () => {
  await initMySQL();
  console.log(`Server runniung at http://localhost:${port}/`);
});
