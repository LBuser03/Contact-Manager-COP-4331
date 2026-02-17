<?php
    $inData = getRequestInfo();

    $id = $inData["id"];
    $newFirstName = $inData["firstName"];
    $newLastName = $inData["lastName"];
    $newPhone = $inData["phone"];
    $newEmail = $inData["email"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "contact_manager");
    
    if ($conn->connect_error) 
    {
        returnWithError( $conn->connect_error );
    } 
    else 
    {
        // SQL update statement
        $stmt = $conn->prepare("UPDATE Contacts SET FirstName=?, LastName=?, Phone=?, Email=? WHERE ID=?");
        $stmt->bind_param("ssssi", $newFirstName, $newLastName, $newPhone, $newEmail, $id);
        
        if ($stmt->execute())
        {
            // Check if any row was actually changed
            if ($stmt->affected_rows > 0)
            {
                returnWithInfo("Update Successful");
            }
            else
            {
                returnWithError("No records found or no changes made");
            }
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
