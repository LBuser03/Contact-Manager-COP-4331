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
    $newFirstName = trim($inData["firstName"] ?? "");
    $newLastName = trim($inData["lastName"] ?? "");
    $newPhone = trim($inData["phone"] ?? "");
    $newEmail = trim($inData["email"] ?? "");
    $oldFirstName = trim($inData["oldFirstName"] ?? "");
    $oldLastName = trim($inData["oldLastName"] ?? "");
    $oldPhone = trim($inData["oldPhone"] ?? "");
    $oldEmail = trim($inData["oldEmail"] ?? "");

    if (!preg_match('/^\d{10}$/', $newPhone))
    {
        returnWithError("Phone number must be exactly 10 digits.");
        exit;
    }

    if (!preg_match('/^[^@\s]+@[^@\s]+\.[^@\s]+$/', $newEmail))
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
        $updated = 0;

        if ($id > 0)
        {
            $stmt = $conn->prepare("UPDATE Contacts SET FirstName=?, LastName=?, Phone=?, Email=? WHERE ID=? AND UserID=?");
            $stmt->bind_param("ssssii", $newFirstName, $newLastName, $newPhone, $newEmail, $id, $userId);

            if (!$stmt->execute())
            {
                returnWithError($stmt->error);
                $stmt->close();
                $conn->close();
                exit;
            }

            $updated = $stmt->affected_rows;
            $stmt->close();
        }

        if ($updated === 0)
        {
            $stmt = $conn->prepare("UPDATE Contacts SET FirstName=?, LastName=?, Phone=?, Email=? WHERE UserID=? AND FirstName=? AND LastName=? AND Phone=? AND Email=? LIMIT 1");
            $stmt->bind_param("ssssissss", $newFirstName, $newLastName, $newPhone, $newEmail, $userId, $oldFirstName, $oldLastName, $oldPhone, $oldEmail);

            if (!$stmt->execute())
            {
                returnWithError($stmt->error);
                $stmt->close();
                $conn->close();
                exit;
            }

            $updated = $stmt->affected_rows;
            $stmt->close();
        }

        if ($updated > 0)
        {
            returnWithInfo("Update Successful");
        }
        else
        {
            // At this point, either the record wasn't found or values were unchanged.
            returnWithInfo("No changes made");
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
