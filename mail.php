<?php
function sendemail($toemail,$mailsubject,$body){
	$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= "Bcc: info@falconsurveillance.in\r\n";

		$headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
		$headers .= "From: falconsurveillance.in Website Enquiry Contact Us Page <info@falconsurveillance.in>" . "\r\n";
		
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
	$email = cleartext($_REQUEST['email']);
	$subject = cleartext($_REQUEST['subject']);
	$msg = cleartext($_REQUEST['msg']);
	
		$strBody = "Following are form details";
		$strBody .= "<p>  Name : $name</p>";
		$strBody .= "<p>  Phone : $phone</p>";
		$strBody .= "<p> Email : $email</p>";
		$strBody .= "<p>Subject : $subject</p>";
		$strBody .= "<p>Message : $msg</p>";
		
	$mailsent = sendemail("info@falconsurveillance.in","falconsurveillance.in Website Enquiry Contact Us Page",$strBody);
	header("location:thank-you.html"); exit;
	
}
?>