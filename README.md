# csv-to-json

## Description
csv-to-json is a simple application to convert CSV files to JSON.

## Instalation

1. Clone the repository: git clone https://github.com/MatasKirvaitis/csv-to-json.git
2. Navigate to the project directory
3. Install the required packages using: npm install
4. Create folders "filesInput" and "filesOutput" in the root folder of the project.
5. Create .env file in the root folder with the following variables:

   `LOG_TO_CONSOLE - values true or false`  
   `SAVE_TO_DB - values true or false`  
   `PG_HOST - hostname for the PSQL database`  
   `PG_PORT - port for the PSQL database`  
   `PG_USER - PSQL user's username`  
   `PG_PASSWORD - PSQL user's password`  
   `PG_DATABASE - PSQL database name`  
   `SERVER_PORT - port to host server on`  
   `SERVER_HOST - server hostname`  

7. Place CSV file you want to convert into "filesInput".
8. In terminal run: docker-compose up
9. Verify database was launched successfully.
10. Run the latest migration using: npm run migration-run
11. Verify migration successfully runs.
12. To start the application use the commands:
         npm run start-server - This starts the server portion of the application, enough to convert files via Postman
         npm run start-client - This starts the client that prompts the user various arguments to run the conversion, server needs to be running for this to work

Client portion will prompt you for the following arguments one by one:
  1. CSV input file name.
  2. JSON output file name.
  3. Whether headers are present in the CSV file (true/false).
  4. Whether the logger should log to console (true) or file (false).
  5. Whether logs should be saved to database (true/false).

To convert another file via client, the client can be stopped using Ctrl + C and launched again.

## Postman
Optionally, the file can also be passed to the application via Postman.

Using POST method for the URL `http://localhost:1337/upload?headers=<true or false>&&file=<file name to use>`.

Headers and name arguments are optional, headers will be set to false by default and a random default file name will be generated.

File will be saved in folder "filesInput" with the name that is passed as argument in URL and also converted file will be saved in "filesOutput".

After sending the file you will receive a response with a link you can download the converted file from.
