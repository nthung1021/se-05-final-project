# Software Engineering - Simple AI Chat Application

A simple software for users to chat with AI chatbot, also allows users to view chat history and see previous chats
(Implementation is in progress and this is not the release version of the source code)

## Web Preview

(will be released soon)

## Getting started

1. Download the source code in ZIP file

2. Install the dependencies:
```
npm install
```
3. Create a database from anywhere, then get the connection string after creating.

4. Create an environment file (.env) and add the connection string
```
DATABASE_URL = "<database-connection-string>"
```

5. Generate the prisma client
```
npx prisma generate
```

6. Update the database from schema (when adding, changing or deleting tables in schema)
```
npm run updatedb
```

7. Run the project
```
npm run start
```

## Live demo

(will be released soon)
