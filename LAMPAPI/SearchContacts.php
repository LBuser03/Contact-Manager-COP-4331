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
	
	$searchResults = array();
	$searchCount = 0;

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "contact_manager");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("SELECT ID AS id, FirstName AS first, LastName AS last, Email AS email, Phone AS phone FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ?) AND UserID=?");
		$contactName = "%" . $inData["search"] . "%";
		$stmt->bind_param("ssi", $contactName, $contactName, $inData["userId"]);
		$stmt->execute();
		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc())
		{
			$searchCount++;
			$searchResults[] = array(
				"id" => (int)$row["id"],
				"first" => $row["first"],
				"last" => $row["last"],
				"email" => $row["email"],
				"phone" => $row["phone"]
			);
		}
		
		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
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
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchResults )
	{
		$retValue = json_encode(array("results" => $searchResults, "error" => ""));
		sendResultInfoAsJson( $retValue );
	}
	
?>
