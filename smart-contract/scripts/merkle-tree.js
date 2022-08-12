const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

let whitelistAddresses = [
    "0x48cE884A1ecead469c50b42370aF2983D59Bbb94",//JQ
    "0xd38796bd8455c30632929B4384a0b5865aeBb9DB",//JQ
    "0x1734A28705322cBa314DBC63706267C95eAf94C6",//chun
    "0x813963b05bcE179693d5f867e30d8F38b8C6a6d0",//rui
    "0xA49a3aE63C366F41B78B282fc502FA3B12728b0D", //mark
    "0xA895FDa27f5b0b80db8f08b9184C75bCe1Fb17A1", //Milad
    "0x6f5194C87C69A04548D50Ce2204a19787FaA87cc",//brenda
    "0xFe543b368B6Fb3b31c545E449668Cfbb87E7cF8d",//doug
    "0xFfBf41a0C23E05e491BEd7514B9558e71c0ED521"//ayu
];

// Create a new array of `leafNodes` by hashing all indexes of the `whitelistAddresses`
// using `keccak256`. Then creates a Merkle Tree object using keccak256 as the algorithm.
//
// The leaves, merkleTree, and rootHas are all PRE-DETERMINED prior to whitelist claim

const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});

//Get root hash of the `merkleeTree` in hexadecimal format (0x)
// Print out the Entire Merkle Tree.
const rootHash = '0x' + merkleTree.getRoot().toString('hex');
//console.log('Whitelist Merkle Tree\n', merkleTree.toString());
console.log("Root Hash: ", rootHash);


//const claimingAddress = leafNodes[2];

//string -> buffer
//const claimingAddress1 = keccak256("0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2");
//console.log("address:",claimingAddress, typeof claimingAddress);

//hex buffer
//const hexProof1 = merkleTree.getHexProof(claimingAddress);
//console.log("proof1:",hexProof1);

//hash root: 0xf5982de8065c8d6bc9526e190a70dc3a204e4ff251d9e91c674a81a5ad1914bf