
import Head from "next/head";
import styles from "../styles/Home.module.css";

import React, { useState } from "react";
import {NFTCard} from "./components/nftCard";


const spicyFight = () => {

    const [NFTs, setNFTs] = useState([]);
    const collectionAddress = "0x8E6A92C8fE0106a62c77c9E4e09b92C81Fbf7A80"; 
    const collectionName = "TooCool Dolander"; 
    

    const fetchNFTs = async () => {

        console.log("fetching nfts");
        
        // Metadata inclusion flag
        const withMetadata = 'true';
        const apiKey ="dlood3GFjMa4VarSoo4piggq9zVMDLRZ";
        const startToken =1;
        const baseURL = `https://eth-mainnet.alchemyapi.io/nft/v2/${apiKey}/getNFTsForCollection`;
        const fetchURL = `${baseURL}?contractAddress=${collectionAddress}&withMetadata=${withMetadata}&startToken=${startToken}}`;
        
        let requestOptions = {
            method: 'GET',
            redirect:'follow'
        };


        const nfts = await fetch(fetchURL, requestOptions).then(data => data.json());
        
    
        if (nfts) {
            console.log("suppose to be metadata",nfts);
            setNFTs(nfts.nfts);
            console.log(nfts.nfts[0].metadata.attributes); 
        }

        fetch(fetchURL,requestOption)
            .then(response => {
            const allNfts = response['data']['nfts'];
            console.log

        })
    };

    fetchNFTs();

    return(
        <div className = {styles.app}>
            <Head>
                <title>TooCool Dolander ✨The most fashionable cat in WEB3✨ </title>
                <meta name="description" content="TooCool Dolander-Dapp" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div>
                {
                    NFTs.length && NFTs.map(nft => {
                        return(
                            <NFTCard nft ={nft}></NFTCard>
                        );
                    })
                }
            </div>
        </div>
    );

}

export default spicyFight;