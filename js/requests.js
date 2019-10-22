function reqs(){
    console.log("funcion reqs presionada")
    var account = document.getElementById('addr').value;
    var amount = 10;
    var message = document.getElementById('txt').value;
    
    fetch(`http://localhost:8080/send?account=${account}&amount=${amount}&message=${message}`)
    .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        console.log(response); // response
        
        codigo = response.code;
        if (codigo == 1){
            alert("Success" +" "+ "Transaction Hash: " + response.transactionHash.data);
            
        }else if(codigo == 0 ){
            alert("Error. Account does not exist");

        }else if(codigo == -1 ){
            alert("Error. Can only claim 10 XEM every 1 hour per Address!")

        }else{
            alert(response.message + response.transactionHash);
        }
      })
} 

