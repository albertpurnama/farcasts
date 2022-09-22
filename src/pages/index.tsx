import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "./index.module.css";
import { utils } from 'ethers';
import REGISTRY_ABI from "../abis/registry";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useSigner } from "wagmi";
import React from "react";
import { useWaitForTransaction } from 'wagmi'
import { useEnsAvatar } from 'wagmi'
import Image from "next/image";
import getAvatar from "../utils/getAvatar";

const FarcastRegistryContractAddress = '0xe3Be01D99bAa8dB9905b33a3cA391238234B79D1';


const stringError = (err: any) => {
  return err?.error?.message;
}

type AccountInformation = {
  username: string;
  address: string;
  directoryURL: string;
}


const EditAccount = ({
  account
}: {
  account: AccountInformation,
}) => {
  const { data: avatarData } = useEnsAvatar({
    addressOrName: account.address,
  });

  const [isEditMode, setIsEditMode] = React.useState(false);

  const [directoryURI, setDirectoryURI] = React.useState(account.directoryURL || '');

  const { data: signer } = useSigner()
  const { config, isError: isPrepareWriteError, error } = usePrepareContractWrite({
    addressOrName: FarcastRegistryContractAddress,
    contractInterface: REGISTRY_ABI,
    signer: signer,
    functionName: 'modify',
    args: [
      directoryURI,
    ],
    enabled: !!directoryURI,
  })
  const { data: writeData, write, isLoading: isWriteLoading } = useContractWrite(config)

  const { data, isError, isLoading, isSuccess } = useWaitForTransaction({
    hash: writeData?.hash,
  })

  let body: any;

  if (isEditMode) {
    body = (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          write?.();
        }}>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="uri">
            Host URI
          </label>
          <input
            defaultValue={account.directoryURL}
            onChange={(e) => setDirectoryURI(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="hosturi" type="text" placeholder="https://your-host-uri.com" />
        </div>
        <div className="flex items-center justify-between">
          <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center  dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="submit" disabled={isPrepareWriteError || !write || isWriteLoading || isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
        <div>
          {
            isError && <p className="mt-6 text-sm text-red-500">Transaction error</p>
          }
          {
            isPrepareWriteError && error && <p className="mt-6 text-sm text-red-500">{stringError(error)}</p>
          }
          {
            isLoading && <p className="mt-6 text-sm">Processing…</p>
          }
          {
            isSuccess && <p className="">Success!</p>
          }
        </div>
      </form>
    )
  } else {
    body = (
      <>
        <div style={{
          width: 50,
          height: 50,
          position: "relative",
        }}>
          <Image
            src={getAvatar(avatarData || account.address)} layout="fill" style={{
              borderRadius: 999,
            }}
            alt="avatar"
          />
        </div>
        <a href="#">
          <h5 className="text-gray-900 font-bold text-2xl tracking-tight mb-2 dark:text-white">{account.username}</h5>
        </a>
        <p className="font-normal text-gray-700 mb-3 dark:text-gray-400">{account.directoryURL}</p>
        <button onClick={() => setIsEditMode(true)} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center  dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Edit
          <svg className="-mr-1 ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" ></path></svg>
        </button>
      </>
    );
  }

  return (
    <div className="bg-white shadow-md border border-gray-200 rounded-lg max-w-sm dark:bg-gray-800 dark:border-gray-700 mt-4">
      <div className="p-5">
        <div className="mb-5">
          <button className="hover:underline" onClick={() => setIsEditMode(false)}>
            Your Account
          </button>
          {isEditMode && ' / Edit'}
        </div>
        {body}
      </div>
    </div>
  );
}

const RegistrationForm = () => {
  const [username, setUsername] = React.useState('');
  const [directoryURI, setDirectoryURI] = React.useState('');

  const { data: signer } = useSigner()
  const { config, isError: isPrepareWriteError, error } = usePrepareContractWrite({
    addressOrName: FarcastRegistryContractAddress,
    contractInterface: REGISTRY_ABI,
    signer: signer,
    functionName: 'register',
    args: [
      utils.formatBytes32String(username),
      directoryURI,
    ],
    enabled: !!username && !!directoryURI,
  })
  const { data: writeData, isSuccess, write } = useContractWrite(config)


  const { data, isError, isLoading } = useWaitForTransaction({
    hash: writeData?.hash,
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        write?.();
      }}
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-4">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
          Username
        </label>
        <input
          onChange={(e) => setUsername(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username" />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="uri">
          Host URI
        </label>
        <input
          onChange={(e) => setDirectoryURI(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="hosturi" type="text" placeholder="https://your-host-uri.com" />
      </div>
      <div className="flex items-center justify-between">
        <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center  dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="submit" disabled={isPrepareWriteError || !write || isLoading}>
          {isLoading ? "Claiming..." : "Claim!"}
        </button>
      </div>
      <div>
        {
          isPrepareWriteError && error && <p className="mt-6 text-sm text-red-500">{stringError(error)}</p>}
        {
          isLoading && <p className="mt-6 text-sm">Processing…</p>
        }
        {
          isError && <p className="mt-6 text-sm text-red-500">Transaction error</p>
        }
      </div>
    </form>
  );
}


const Home: NextPage = () => {
  const { address, isConnected } = useAccount();
  const {
    data: username,
  } = useContractRead({
    addressOrName: FarcastRegistryContractAddress,
    contractInterface: REGISTRY_ABI,
    functionName: 'addressToUsername',
    args: [
      address,
    ],
  });

  const {
    data: directoryURL
  } = useContractRead({
    addressOrName: FarcastRegistryContractAddress,
    contractInterface: REGISTRY_ABI,
    functionName: 'getDirectoryUrl',
    args: [
      username,
    ],
    enabled: !!username
  });

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true)
  }, []);



  const accInfo: AccountInformation | null = username && directoryURL && address ? {
    username: utils.parseBytes32String(username),
    directoryURL: directoryURL as unknown as string,
    address: address
  } : null;

  return (
    <>
      <Head>
        <title>Farcasts</title>
        <meta name="description" content="Farcaster Client" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.containerOuter}>
        <div className={styles.containerInner}>
          <div className="flex flex-col justify-center align-middle m-4">
            <h1 className="text-3xl font-medium text-center">Farcasts</h1>
            <p className="text-l text-center">Claim your Farcaster handle.</p>
            <p className="text-center text-xs text-gray-500">Learn more about <a href="https://farcaster.xyz" className="hover:underline">Farcaster</a></p>
          </div>
          <ConnectButton />
          {
            isMounted && isConnected && !accInfo?.username && (
              <RegistrationForm />
            )
          }
          {
            isMounted && accInfo &&
            <EditAccount account={accInfo} />
          }

          <p className="text-sm mt-4">Created by <a className="hover:underline" href="https://twitter.com/AlbertPurnama" target="_blank" rel="noreferrer" >Albert</a></p>
        </div>
      </div>
    </>
  );
};

export default Home;
