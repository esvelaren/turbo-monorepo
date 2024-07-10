$Server = ""
$Password = ""
$Database = ""

Write-Output "Stopping and removing old docker [$Server] and starting a new fresh instance of [$Server]"

try {
    docker stop $Server
    docker rm $Server
} catch {
    # Ignore errors if containers are not found
}

docker run --name $Server -e POSTGRES_PASSWORD=$Password `
  -e PGPASSWORD=$Password `
  -p 6543:5432 `
  -d postgres

# Wait for PostgreSQL to start
Write-Output "Sleeping to wait for PostgreSQL server [$Server] to start"
Start-Sleep -Seconds 3

# Create the database
docker exec -i $Server psql -U postgres -c "CREATE DATABASE $Database ENCODING 'UTF-8';"
docker exec -i $Server psql -U postgres -c "\l"