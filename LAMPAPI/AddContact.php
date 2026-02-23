<?php
// 1. Allow the Origin (Essential for Live Preview)
header("Access-Control-Allow-Origin: *");

// 2. Allow the Methods (POST is what your search uses)
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

// 3. Allow the Content-Type (Essential for JSON payloads)
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 4. Handle the "Preflight" Request (The bouncer)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}
    $inData = getRequestInfo();

    $firstName = trim($inData["firstName"] ?? "");
    $lastName = trim($inData["lastName"] ?? "");
    $phone = trim($inData["phone"] ?? "");
    $email = trim($inData["email"] ?? "");
    $userId = $inData["userId"] ?? 0;

    if (!preg_match('/^\d{10}$/', $phone))
    {
        returnWithError("Phone number must be exactly 10 digits.");
        exit;
    }

    if (!preg_match('/^[^@\s]+@[^@\s]+\.[^@\s]+$/', $email))
    {
        returnWithError("Email must be in the format name@example.com.");
        exit;
    }

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "contact_manager");
    
    if ($conn->connect_error) 
    {
        returnWithError( $conn->connect_error );
    } 
    else 
    {
        $stmt = $conn->prepare("INSERT into Contacts (FirstName, LastName, Phone, Email, UserID) VALUES(?,?,?,?,?)");
        $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);
        
        if ($stmt->execute())
        {
            returnWithInfo("Contact Added Successfully");
        }
        else
        {
            returnWithError($stmt->error);
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson( $obj )
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError( $err )
    {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }

    function returnWithInfo( $info )
    {
        $retValue = '{"message":"' . $info . '","error":""}';
        sendResultInfoAsJson( $retValue );
    }
?>
