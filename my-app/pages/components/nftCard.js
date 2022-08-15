export const NFTCard = ({ nft }) => {

    return (
        <div>
            <div>
                <img src={nft.media[0].gateway}/>
            </div>
            <div>
                <h2>{nft.title}</h2>
                {/* <p>{nft.metadata.attributes[0].value}</p> */}
            </div>
            <div>
                <a href={`http://etherscan.io/token/${nft.contract.address}`} target="_blank" rel="noreferrer">View on etherscan</a>
            </div>
        </div>
    );
}


