import { Contract, ethers, providers, utils} from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";


import { abi, NFT_CONTRACT_ADDRESS} from "../constants";
import styles from "../styles/Home.module.css";
import { addressList } from "../address";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // get wallet address
  const [address, setAddress] = useState("0");
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);

  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0"); 
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  //const web3ModalRef = useRef();

  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [soldOut, setSoldOut] = useState(false);

  const [merkleTree, setMerkleTree] = useState(null);
  const [rootHash, setrootHash] = useState(null);
  const [merkleProof, setmerkleProof] = useState("");

  const [isValid, setisValid] = useState(false);
  const [isClaimed, setisClaimed] = useState(false);

  const [transactionHash, setTransactionHash] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [receiveTokenAddress,setReceiveTokenAddress] = useState(false);


  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const presaleStarted = await nftContract.catWalkStarted();
      console.log("Has Presale started? --", presaleStarted);
      //_whitelistMintedStarted = false then do the following
      if (!presaleStarted){
        console.log("...", presaleStarted);
      }   
      setPresaleStarted(presaleStarted);
      return presaleStarted;   

    } catch (err) {
      console.error(err);
    }
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const presaleEnded = await nftContract.catWalkEnded();
      console.log("Has Presale ended? --", presaleEnded);
      //presaleEnded = true then do the following
      if (presaleEnded){
        console.log("Public Sale Started");
      }
      setPresaleEnded(presaleEnded);
      return presaleEnded; 

    } catch (err) {
      console.error(err);
    }
  };

  /**
   * checkifClaimed: Check if the address has claimed an NFT 
   */
  const checkifClaimed = async () => {
    try {
     const signer = await getProviderOrSigner(true);
     const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
     const signerAddress = await signer.getAddress();
    // call the balance of the address
    const balance = await nftContract.balanceOf(signerAddress);
    //console.log("balance --", balance.toNumber());
    if(balance > 0){
      isClaimed = true;
    }

    setisClaimed(isClaimed);
    console.log("Has the HUMAN claimed a TCD? --", isClaimed);
    return isClaimed; 

} catch (err) {
  console.error(err);
}
  };

   /**
   * checkifValid: Check if the address is valid for presale
   */
  const checkifValid = async () => {
    try {

      console.log("Checking... Who is this human?")

      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to  MetaMask

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      //get address
      const signerAddress = await signer.getAddress();
      //console.log("providerAddress:", signerAddress, typeof signerAddress);

        //build a tree
        const leafNodes = addressList.map(addr => keccak256(addr))
        const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});
        setMerkleTree(merkleTree);

        //get the tree root
        const rootHash = '0x' + merkleTree.getRoot().toString('hex');
        setrootHash(rootHash);

        //get claimingAddress object
        const claimingAddress= keccak256(signerAddress);
        //console.log("claimingAddress", claimingAddress, typeof claimingAddress);
        
        //get merkle proof for the claiming address
        const merkleProof =  merkleTree.getHexProof(claimingAddress);
        setmerkleProof(merkleProof);
      //console.log("merkleProof:",merkleProof, typeof merkleProof);
      
      //Edit format 
      //const proofAddress = merkleProof.toString().replaceAll('\'', '').replaceAll(' ', '');
      // console.log("ProofAddress:",  proofAddress, typeof proofAddress);

      const isValid = merkleTree.verify(merkleProof, claimingAddress, rootHash);
      setisValid(isValid);

      console.log("Is this human on the prestigious Fashion List? --", isValid);
      return isValid, merkleProof;

    }
    catch (err) {
      console.error(err);
    }
  };


  const presaleMint = async () => {
    try {
      console.log("Presale mint");
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);

      // Create a new instance of the Contract with a Signer, which allows
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      // call the presale from the contract and pass true to it
      const tx = await nftContract.fashionlistMint(merkleProof, {
        value: utils.parseEther("0.0"),
      });

      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);

      const transactionHash = tx.hash;
      setTransactionHash(transactionHash);
      const tokenAddress = "https://etherscan.io/tx/" + transactionHash;
      setTokenAddress(tokenAddress);

     
     window.alert("OMG! ???????????????????????? ?????? ????????? You are TooCool!");
     return tokenAddress;

    } catch (err) {
      console.error(err);
    }
  };

  /**
   * publicMint: Mint an NFT
   */
  const publicMint = async () => {
    try {
      console.log("Public mint");
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the mint from the contract to mint the LW3Punks
      const tx = await nftContract.beTooCool({
        // value signifies the cost of one LW3Punks which is "0.01" eth.
        // We are parsing `0.01` string to ether using the utils library from ethers.js
        value: utils.parseEther("0.0"),
      });

      // console.table(tx);
      setLoading(true);
      await tx.wait();
      setLoading(false);

      const transactionHash = tx.hash;

      setTransactionHash(transactionHash);
      const tokenAddress = "https://etherscan.io/tx/" + transactionHash;
      setTokenAddress(tokenAddress);

      receiveTokenAddress = true;
      setReceiveTokenAddress(true);

      window.alert("OMG! ???????????????????????? ?????? ????????? You are TooCool!");
      return tokenAddress;

    } catch (err) {
      console.error(err);
    }
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
      console.log("Connecting to the human");
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getTokenIdsMinted: gets the number of tokenIds that have been minted
   */
  const getTokenIdsMinted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the tokenIds from the contract
      const _tokenIds = await nftContract.totalSupply();
    
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };
//
const checkTransactionAddress = async () => {
  try {

    if (transactionHash == 0){
      const tokenAddress = "https://opensea.io/collection/toocooldolander";
      setTokenAddress(tokenAddress);
      receiveTokenAddress = false;
    }
    setReceiveTokenAddress(receiveTokenAddress);
  } catch (err) {
    console.error(err);
  }
};

////
  const checkifSoldOut = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _tokenIds = await nftContract.totalSupply();

      if(_tokenIds.toString() == '3333'){
        soldOut = true;
      }
      setSoldOut(soldOut);
      return soldOut;

    } catch (err) {
      console.error(err);
    }
  };
  
  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  
  const getProviderOrSigner = async (needSigner = false) => {

  
    let web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: false,
      providerOptions: {
      },
      disableInjectedProvider: false,
    });

    const provider = await web3Modal.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    // const provider = await web3ModalRef.current.connect();
    // const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Mumbai network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 1) {
      window.alert("Change the network to Mainnet");
      throw new Error("Change network to Mainnet");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };


  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (walletConnected) {
      const presaleStarted = checkIfPresaleStarted();
      
      // if started = true, then check if it has ended
      if (presaleStarted) {
        checkIfPresaleEnded();
      }
      getTokenIdsMinted();
      checkTransactionAddress();
      checkifSoldOut();

   
        checkifClaimed();
        checkifValid();   

      // set an interval to get the number of token Ids minted every 3 seconds
        setInterval(async function () {
          await getTokenIdsMinted();
          await checkifClaimed();
          await checkifSoldOut();
        }, 3 * 1000);
      }
  }, [walletConnected]);

  /*
    renderScreen: Returns the computer image
  */
  const renderScreen = () =>{
    if (!walletConnected) {
      return <img className = {styles.screenFrame}  src="./ele/Front_pc.gif"  alt="cool computer" />
    }

    if (!presaleStarted && !presaleEnded) {
      return <img className = {styles.screenFrame}  src="./ele/frontImage1.png"  alt="cool computer" />
    }

    if (presaleStarted && !presaleEnded) {
      return <img className = {styles.screenFrame}  src="./ele/frontImage_presale.png"  alt="cool computer" />
    }

    if (presaleStarted && presaleEnded) {
      return <img className = {styles.screenFrame}  src="./ele/frontImage_publicsale.png"  alt="cool computer" />
    }
  };
  /*
    renderDescription: Returns description of the state of the dapp
  */
 const renderDescription =() => {
   // If wallet is not connected, return a button which allows them to connect their wallet

if (!walletConnected) {
  return (
    <div>
   
    </div>
  );
}

if(!walletConnected && soldOut){
return (
  <div>
    <div className={styles.descriptionLarge}>
      3333 SOLD OUT!
    </div>
     <div className={styles.description}>
       Get your TooCool 
       @ marketplace ????
     </div>
 </div>
);
}

      // If we are currently waiting for something, return a loading button
      if (loading) {
        return (
          <div>
              <div className={styles.descriptionLarge}>
              ???Minting... 
              </div>  
          </div>
          );
      }

   // if presale started = true, ended = false, if valid then presale mint
  if (presaleStarted && !presaleEnded && isValid && !isClaimed) {
    return (
      <div>
        <div className={styles.descriptionLarge}>
           {tokenIdsMinted}/3333
        </div>
        <div className={styles.description}>
           have been minted
        </div>
        <div className={styles.description}>
            You go, girl!  <br></br>Mint a TooCool Dolander ????
        </div>
      </div>
    );
  }

   // if started = true, ended = false, but not on the list
   if (presaleStarted && !presaleEnded && !isValid) {
    return (
      <div>
        <div className={styles.descriptionLarge}>
          {tokenIdsMinted}/3333
        </div>
        <div className={styles.description}>
          have been minted
        </div>
        <div className={styles.description}>
            Opps...Not your turn
            <br></br><br></br>
            Public sale: August 13th
        </div>
      </div>
    );
  }

  // If presale started and has ended, its time for public minting
  // if started = true ended =true , then public mint
  if (presaleStarted && presaleEnded && !isClaimed) {
    return (
    <div>
        <div className={styles.descriptionLarge}>
          {tokenIdsMinted}/3333
        </div>
        <div className={styles.description}>
          have been minted
        </div>
        <div className={styles.description}>
        ???? Bling Bling Time! <br></br>Mint a TooCool Dolander 
        </div>  
    </div>
    );
  }

  
   //If token has already be minted
   if (isClaimed) {
    return (
      <div>
        <div className={styles.descriptionLarge}>
          {tokenIdsMinted}/3333
        </div>
        <div className={styles.description}>
          have been minted
        </div>
         <div className={styles.description}>
           Booyah! You look TooCool! ????
         </div>
     </div>
    );
}   


}

  const renderButton = () => {
    //connect wallet, uncheck the connectwallet button after presale starts
    if (!walletConnected) {
      return (
      <div className={styles.buttonContainer}>
         <a href="https://opensea.io/collection/toocooldolander"  target="_blank" rel="noreferrer">
             <img className={styles.buttonImage} src="./ele/btn-viewnft.gif"  alt=" Button" />     
         </a>
      </div>
      );
    }

    if (loading) {
      return (
        <div className={styles.buttonContainer}>
          <img className={styles.buttonImage} src="./ele/btn-loading.gif"  alt=" Button" />
        </div>
       );
    }

    //presale start
    if (presaleStarted && !presaleEnded && isValid && !isClaimed) {
      return (
      <div className={styles.buttonContainer}>
         <img className={styles.buttonImage} onClick={presaleMint} src="./ele/btn-mint.gif"  alt=" Button" />
      </div>
      );
    }

    if (presaleStarted && !presaleEnded && !isValid) {
      return (
        <div className={styles.buttonContainer}>

       </div>
      );
    }

    //public sale start
    if (presaleStarted && presaleEnded && !isClaimed) {
      return (
      <div className={styles.buttonContainer}>
         <img className={styles.buttonImage} onClick={publicMint} src="./ele/btn-mint.gif"  alt=" Button" />
      </div>
      );
    }  

     //If token has already be minted
     if (isClaimed) {
      return (
        <div className={styles.buttonContainer}>    
            <a href={tokenAddress}  target="_blank" rel="noreferrer">
              <img className={styles.buttonImage} src="./ele/btn-viewnft.gif"  alt=" Button" />     
             </a>
        </div>
      );
   }   

    //Default state: Join fashion list
    return (
      <div className={styles.buttonContainer}>

      </div>
     );
  };

  return (
    <div className = {styles.app}>
      <Head>
        <title>TooCool Dolander ???The most fashionable cat in WEB3??? </title>
        <meta name="description" content="TooCool Dolander-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className = {styles.nav}>
        
          <a href="https://nftspy.net/rarity/toocooldolander" target="_blank" rel="noreferrer">
            <img  className = {styles.socialmediaIMG} src="https://media.nftspy.net/BannerBlack.webp" alt="nftspy-logo"/>
          </a>            
          <button className = {styles.socialmediaBtn} type="button"> 
              <a href="https://opensea.io/collection/toocooldolander"  target="_blank" rel="noreferrer">
                <img className = {styles.socialmediaIMG} src="./ele/button_opensea.png" alt="opensea-logo" />
              </a>  </button>
          
          <button className ={styles.socialmediaBtn} type="button"> 
              <a href="https://www.instagram.com/toocoolxcat/" target="_blank" rel="noreferrer">
                <img className = {styles.socialmediaIMG}  src="./ele/button_instagram.png"  alt="ins-logo" />
             </a>  </button>

            <button className ={styles.socialmediaBtn} type="button">
            <a href="https://twitter.com/toocoolXcat" target="_blank" rel="noreferrer">
              <img className = {styles.socialmediaIMG}  src="./ele/button_twitter.png" alt="twitter-logo" />
              </a> </button>

            <button className ={styles.socialmediaBtn} type="button">
            <a href="https://discord.gg/dcQvyqEEs7" target="_blank" rel="noreferrer">
              <img className = {styles.socialmediaIMG}  src="./ele/button_discord.png" alt="discord-logo" />
              </a> </button>
    </div>
      <div className={styles.main}>
        <div className={styles.mainContent}>
        <img className={styles.title} src="./ele/title_dolander.gif" alt="logo" />

          <div className={styles.screenContainer}>
                {renderScreen()}
              <div className={styles.screenContent}>
                {renderDescription()}
              </div>
          </div>

          <div className={styles.buttonContainer}>
             {renderButton()}
          </div>

          <div  className={styles.flexbox_desktop}>
            <div className={styles.flexbox_item}>
              <img className={styles.item_AboutTooCool} src="./ele/AboutToocool.png" alt="AboutTooCool" />
            </div>
            <div className={styles.flexbox_item}>
               <img  className={styles.item_AboutTeam} src="./ele/AboutTeam.png" alt="AboutTeam" />
            </div>
            <div className={styles.flexbox_item}> 
               <img  className={styles.item_Benefit}src="./ele/Benefits.png" alt="Benefits" />
            </div>
            <div className={styles.flexbox_item}>
               <img  className={styles.item_AboutNFT}  src="./ele/AboutNFT.png" alt="AboutNFT" />
             </div>
            <div className={styles.flexbox_item}>
               <img  className={styles.item_AboutDodo}  src="./ele/AboutDodo.png" alt="AboutDodo" /> 
            </div>           
          </div>

          <div  className={styles.flexbox_mobile}>
            <div className={styles.flexbox_item}>
              <img className={styles.item_AboutTooCool} src="./ele/AboutToocool.png" alt="AboutTooCool" />
            </div>
            <div className={styles.flexbox_item}> 
              <img  className={styles.item_Benefit}src="./ele/Benefits_mobile.png" alt="Benefits" />
            </div>
            <div className={styles.flexbox_item}>
               <img  className={styles.item_AboutNFT}  src="./ele/AboutNFT_mobile.png" alt="AboutNFT" />
            </div>
            <div className={styles.flexbox_item}>
               <img  className={styles.item_AboutDodo}  src="./ele/AboutDodo_mobile.png" alt="AboutDodo" /> 
            </div>
            <div className={styles.flexbox_item}>
               <img  className={styles.item_AboutTeam} src="./ele/AboutTeam_mobile.png" alt="AboutTeam" />
            </div>

          </div>

           <div className={styles.footer}>
           <img  className={styles.item_Roadmap_mobile}  src="./ele/Roadmap_mobile.png" alt="AboutDodo" />
           <img  className={styles.item_Roadmap}  src="./ele/Roadmap.png" alt="AboutDodo" />
              <div className={styles.footerNav}>
              <img  className={`${styles.socialmediaBtn} ${styles.catItem}`} src="./ele/catIcon.png" alt="cat" />
                <button className = {styles.socialmediaBtn} type="button"> 
                      <a href="https://opensea.io/collection/toocooldolander"  target="_blank" rel="noreferrer">
                        <img className = {styles.socialmediaIMG} src="./ele/button_opensea.png" alt="opensea-logo" />
                      </a>  </button>
                  
                  <button className ={styles.socialmediaBtn} type="button"> 
                      <a href="https://www.instagram.com/toocoolxcat/" target="_blank" rel="noreferrer">
                        <img className = {styles.socialmediaIMG}  src="./ele/button_instagram.png"  alt="ins-logo" />
                    </a>  </button>

                    <button className ={styles.socialmediaBtn} type="button">
                    <a href="https://twitter.com/toocoolXcat" target="_blank" rel="noreferrer">
                      <img className = {styles.socialmediaIMG}  src="./ele/button_twitter.png" alt="twitter-logo" />
                      </a> </button>

                    <button className ={styles.socialmediaBtn} type="button">
                    <a href="https://discord.gg/dcQvyqEEs7" target="_blank" rel="noreferrer">
                      <img className = {styles.socialmediaIMG}  src="./ele/button_discord.png" alt="discord-logo" />
                      </a> </button>
               </div>
 
            </div>
        </div>

      </div>
    </div>
  );
}