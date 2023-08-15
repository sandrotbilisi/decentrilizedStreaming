import React, {useContext, useEffect, useState} from "react";
import { ethers } from 'ethers'

import { contractABI, contractAddress } from "../utils/constans";
import exp from "constants";

export const LiveStrimingContext = React.createContext()
const [currentAccount, setCurrentAccount] = useState('')
const { ethereum } = window;

const getBnBContract = () => {
    const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545')
    const signer = provider.getSigner()

    console.log({
        provider,
        signer
    })
}

export const LiveStrimingProvider = ({ children }) => {
    const [connectedAccount, setConnectedAccount] = useState('')
    
    const CheckIfWalletIsConnected = async () => {
        if(!ethereum) return alert("Please install metamask")

        const account = await ethereum.request({ method: "eth_accounts"})

        console.log(account)
    }

    useEffect(() => {
        CheckIfWalletIsConnected()
    }, [])

    const ConnectWallet = async() => {
        try{
            if(!ethereum) return alert("Please install metamask")

            const accounts = await ethereum.request({ method: "eth_requestAccounts"})

            setCurrentAccount(accounts[0])
        } catch (error){
            console.log(error)

            throw new Error("No Ethereum Object");
        }
    }


    return (

        <LiveStrimingContext.Provider value={{ ConnectWallet }}>
            {children}
        </LiveStrimingContext.Provider>
    )
}