<?php
function sendemail($toemail,$mailsubject,$body){
	$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= "Bcc: info@falconsurveillance.in\r\n";

		$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
		$headers .= "From: falconsurveillance.in Website Enquiry Home Page <info@falconsurveillance.in>" . "\r\n";
		
		$mailit = mail($toemail,$mailsubject,$body,$headers);
		if($mailit){
			$msg = "success";
		}else{
			$msg = "fail";
		}
		
		return $msg;
	
}
	function cleartext($id){
		$id = trim(str_replace("'", "", $id));
		$id = strip_tags($id);
		return $id;
		
	}
if(isset($_REQUEST['submit'])){
	 $name = cleartext($_REQUEST['name']);
	$phone = cleartext($_REQUEST['phone']);
	$message = cleartext($_REQUEST['message']);
	
		$strBody = "Following are form details";
		$strBody .= "<p>  Name : $name</p>";
		$strBody .= "<p>Pnone No : $phone</p>";
		$strBody .= "<p>Meassage : $message</p>";
		
		
	$mailsent = sendemail("info@falconsurveillance.in","falconsurveillance.in Website Enquiry Home Page",$strBody);
	header("location:thank-you.html"); exit;
	
}
?>