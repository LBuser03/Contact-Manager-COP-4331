<?php
    $inData = getRequestInfo();

    $id = $inData["id"];
    $userId = $inData["userId"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "contact_manager");
    
    if ($conn->connect_error) 
    {
        returnWithError( $conn->connect_error );
    } 
    else 
    {
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=? AND UserID=?");
        $stmt->bind_param("ii", $id, $userId);
        
        if ($stmt->execute())
        {
            if ($stmt->affected_rows > 0)
            {
                returnWithInfo("Contact Deleted Successfully");
            }
            else
            {
                returnWithError("No record found or you do not have permission to delete this contact");
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
