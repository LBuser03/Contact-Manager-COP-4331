<?php

$inData = getRequestInfo();

$firstName = $inData["firstName"];
$lastName  = $inData["lastName"];
$login     = $inData["loginName"];
$password  = $inData["password"];

// ---------- ENVIRONMENT TOGGLE ----------
$isLocal = ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1');

if ($isLocal)
{
    // Local MAMP
    $conn = new mysqli("localhost", "root", "root", "contact_manager");
}
else
{
    // Production server
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "contact_manager");
}

if ($conn->connect_error)
{
    returnWithError($conn->connect_error);
}

// ---------- CHECK IF USERNAME EXISTS ----------
$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
$stmt->bind_param("s", $login);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0)
{
    $stmt->close();
    $conn->close();
    returnWithError("Username already exists");
}

// ---------- INSERT NEW USER ----------
$stmt = $conn->prepare(
    "INSERT INTO Users (FirstName, LastName, Login, Password)
     VALUES (?, ?, ?, ?)"
);
$stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
$stmt->execute();

$userId = $stmt->insert_id;

$stmt->close();
$conn->close();

// ---------- RETURN SAME FORMAT AS LOGIN ----------
returnWithInfo($firstName, $lastName, $userId);




// ---------- HELPER FUNCTIONS ----------
function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError($err)
{
    $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
    exit();
}

function returnWithInfo($firstName, $lastName, $id)
{
    $retValue = '{"id":' . $id .
                ',"firstName":"' . $firstName .
                '","lastName":"' . $lastName .
                '","error":""}';
    sendResultInfoAsJson($retValue);
}

?>
