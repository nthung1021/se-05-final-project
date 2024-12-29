# Software Engineering - Simple AI Chat Application

A simple software for users to chat with AI chatbot, also allows users to view chat history and see previous chats

(Implementation is in progress and this is not the release version of the source code)

## Link to GitHub code

https://github.com/nthung1021/se-05-final-project

## Web Preview

(will be released soon)

## Getting started

1. Download the source code in ZIP file or git clone the source code

2. Install the dependencies:
```
npm install
```
3. Create a database from anywhere, then get the connection string after creating.

4. Create an environment file (.env) and add the connection string
```
DATABASE_URL = "<database-connection-string>"
```

5. Go to the page https://openai.com/index/openai-api/, sign up and generate the API key
   
6. Add the API link and key into the environment file (.env)
```
JARVIS_API_URL="https://api.openai.com/v1/chat/completions"
JARVIS_API_KEY="<your-api-key>"
```

7. Generate the prisma client
```
npx prisma generate
```

8. Update the database from schema (when adding, changing or deleting tables in schema)
```
npm run updatedb
```

9. Update the CSS style of the page if there is changes
```
npm run tailwind
```
  
10. Run the project
```
npm run start
```

## Live demo

(will be released soon)
