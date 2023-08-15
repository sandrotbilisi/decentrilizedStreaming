// const web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545"); // connect to local Ethereum node
// const contractAddress = "0x83F8314Aa188c6527d87A3c5FC008e1AdF9fC5b7"; // replace with your contract address
// const liveStreaming = new web3.eth.Contract(LiveStreaming.abi, contractAddress);
// let realAcoount;

// // document.getElementById("connectWallet").addEventListener('click', async () = {
  
// // } )

// async function Connect () {
//     if (typeof window != 'undefined' &&  typeof window.ethereum != 'undefined') {
//       try {
//         const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
//         realAcoount = accounts[0]
//         console.log( typeof accounts[0])
//       }
//       catch(error) {
//         console.log(error.message)
//       }
//     }
// }
// Connect()
// // create stream button
// const createStreamButton = document.getElementById("createStreamBtn");
// console.log(createStreamButton)
// createStreamButton.addEventListener("click", async () => {
//   const watchFee = parseInt(document.getElementById("fee").value);
//   console.log(typeof realAcoount)
//   await liveStreaming.methods.createStream(watchFee).send({ from: realAcoount });
//   console.log("Stream created!");
// });

// // get streams
const streamsList = document.getElementById("streamTable");
liveStreaming.events.StreamCreated({}, (error, event) => {
  console.log("CREATED")
  if (error) console.error(error);
  else {
    const streamId = event.returnValues.streamId;
    const owner = event.returnValues.owner;
    const streamItem = document.createElement("li");
    streamItem.innerHTML = `Stream ID: ${streamId} | Owner: ${owner} | Watch Fee: ${watchFee}`;
    const joinStreamButton = document.createElement("button");
    joinStreamButton.innerHTML = "Join";
    joinStreamButton.addEventListener("click", () => {
      const watchFee = parseInt(event.returnValues.watchFee);
      web3.eth.sendTransaction({
        from: web3.eth.defaultAccount,
        to: contractAddress,
        value: watchFee,
        data: liveStreaming.methods.joinStream(streamId).encodeABI(),
      });
    });
    streamItem.appendChild(joinStreamButton);
    streamsList.appendChild(streamItem);
  }
});

// // watch stream
// liveStreaming.events.WatcherAdded({}, (error, event) => {
//   if (error) console.error(error);
//   else {
//     const streamId = event.returnValues.streamId;
//     const watcher = event.returnValues.watcher;
//     console.log(`${watcher} joined stream ${streamId}`);
//   }
// });
