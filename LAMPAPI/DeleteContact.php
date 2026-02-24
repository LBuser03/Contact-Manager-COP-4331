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

    $id = $inData["id"] ?? 0;
    $userId = $inData["userId"] ?? 0;
    $firstName = trim($inData["firstName"] ?? "");
    $lastName = trim($inData["lastName"] ?? "");
    $phone = trim($inData["phone"] ?? "");
    $email = trim($inData["email"] ?? "");

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "contact_manager");
    
    if ($conn->connect_error) 
    {
        returnWithError( $conn->connect_error );
    } 
    else 
    {
        $deleted = 0;

        if ($id > 0)
        {
            $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=? AND UserID=?");
            $stmt->bind_param("ii", $id, $userId);

            if (!$stmt->execute())
            {
                returnWithError($stmt->error);
                $stmt->close();
                $conn->close();
                exit;
            }

            $deleted = $stmt->affected_rows;
            $stmt->close();
        }

        if ($deleted === 0)
        {
            $stmt = $conn->prepare("DELETE FROM Contacts WHERE UserID=? AND FirstName=? AND LastName=? AND Phone=? AND Email=? LIMIT 1");
            $stmt->bind_param("issss", $userId, $firstName, $lastName, $phone, $email);

            if (!$stmt->execute())
            {
                returnWithError($stmt->error);
                $stmt->close();
                $conn->close();
                exit;
            }

            $deleted = $stmt->affected_rows;
            $stmt->close();
        }

        if ($deleted > 0)
        {
            returnWithInfo("Contact Deleted Successfully");
        }
        else
        {
            returnWithError("No record found or you do not have permission to delete this contact");
        }

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
