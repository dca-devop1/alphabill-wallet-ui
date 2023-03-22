import axios from "axios";

import {
  IBillsList,
  IBlockStats,
  ITransfer,
  IProofsProps,
  ISwapTransferProps,
  IBill,
  IFungibleAsset,
  IFungibleResponse,
  ITypeHierarchy,
  IRoundNumber,
} from "../types/Types";
import { base64ToHexPrefixed } from "../utils/utils";

export const MONEY_NODE_URL = import.meta.env.VITE_MONEY_NODE_URL;
export const MONEY_BACKEND_URL = import.meta.env.VITE_MONEY_BACKEND_URL;
export const TOKENS_BACKEND_URL = import.meta.env.VITE_TOKENS_BACKEND_URL;

export const getBalance = async (pubKey: string): Promise<any> => {
  if (
    !pubKey ||
    Number(pubKey) === 0 ||
    !Boolean(pubKey.match(/^0x[0-9A-Fa-f]{66}$/))
  ) {
    return;
  }

  const response = await axios.get<{ balance: number; pubKey: string }>(
    `${MONEY_BACKEND_URL}/balance?pubkey=${pubKey}`
  );

  let res = response.data;
  res = { ...response.data, pubKey: pubKey };

  return res;
};

export const getBillsList = async (pubKey: string): Promise<any> => {
  if (
    !pubKey ||
    Number(pubKey) === 0 ||
    !Boolean(pubKey.match(/^0x[0-9A-Fa-f]{66}$/))
  ) {
    return;
  }

  const limit = 100;
  let billsList: IBill[] = [];
  let offset = 0;
  let totalBills = null;

  while (totalBills === null || Number(billsList?.length) < totalBills) {
    const response = await axios.get<IBillsList>(
      `${MONEY_BACKEND_URL}/list-bills?pubkey=${pubKey}&limit=${limit}&offset=${offset}`
    );

    const { bills, total } = response.data;
    totalBills = total;
    billsList = billsList.concat(bills);

    offset += limit;
  }

  return billsList;
};

export const fetchAllTypes = async (
  kind: string = "fungible",
  limit: number = 100,
  offsetKey: string = ""
) => {
  const types = [];
  let nextOffsetKey: string | null = offsetKey;

  while (nextOffsetKey !== null) {
    const response: any = await axios.get(
      TOKENS_BACKEND_URL +
        (nextOffsetKey ? nextOffsetKey : `/kinds/${kind}/types?limit=${limit}`)
    );

    const data = response.data;

    // Add types to the list
    data && types.push(...data);

    // Check if there is a "next" link in the response header
    const linkHeader = response.headers.link;

    if (linkHeader) {
      const nextLinkMatch = linkHeader.match(/<([^>]+)>; rel="next"/);
      if (nextLinkMatch) {
        // Extract the next offset key from the link header
        nextOffsetKey = nextLinkMatch[1];
      } else {
        nextOffsetKey = null;
      }
    } else {
      nextOffsetKey = null;
    }
  }

  return types;
};

export const getTypeHierarchy = async (typeId: string) => {
  const response = await axios.get<ITypeHierarchy[]>(
    `${TOKENS_BACKEND_URL}/types/${base64ToHexPrefixed(typeId)}/hierarchy`
  );

  return response.data;
};

export const getUserTokens = async (
  owner: string,
  activeAsset?: string,
  kind: string = "fungible",
  limit = 100,
  offsetKey = ""
) => {
  if (
    !owner ||
    Number(owner) === 0 ||
    !Boolean(owner.match(/^0x[0-9A-Fa-f]{66}$/))
  ) {
    return;
  }

  const tokens: any = [];
  let nextOffsetKey: string | null = offsetKey;

  while (nextOffsetKey !== null) {
    const response: any = await axios.get(
      TOKENS_BACKEND_URL +
        (nextOffsetKey
          ? nextOffsetKey
          : `/kinds/${kind}/owners/${owner}/tokens?limit=${limit}`)
    );

    const data = response.data;

    // Add tokens to the list
    data && tokens?.push(...data);

    // Check if there is a "next" link in the response header
    const linkHeader = response.headers.link;

    if (linkHeader) {
      const nextLinkMatch = linkHeader.match(/<([^>]+)>; rel="next"/);
      if (nextLinkMatch) {
        // Extract the next offset key from the link header
        nextOffsetKey = nextLinkMatch[1];
      } else {
        nextOffsetKey = null;
      }
    } else {
      nextOffsetKey = null;
    }
  }

  const updatedArray = tokens?.map((obj: IFungibleResponse) => {
    return {
      id: obj.id,
      typeId: obj.typeId,
      owner: obj.owner,
      value: obj.amount,
      decimals: obj.decimals,
      kind: obj.kind,
      txHash: obj.txHash,
      symbol: obj.symbol,
    };
  });

  const filteredTokens = updatedArray?.filter(
    (token: IFungibleAsset) => token.typeId === activeAsset
  );

  return activeAsset ? filteredTokens : tokens;
};

export const getProof = async (billID: string): Promise<any> => {
  if (!Boolean(billID.match(/^0x[0-9A-Fa-f]{64}$/))) {
    return;
  }

  const response = await axios.get<IProofsProps>(
    `${MONEY_BACKEND_URL}/proof?bill_id=${billID}`
  );

  return response.data;
};

export const getBlockHeight = async (isAlpha: boolean): Promise<bigint> => {
  const response = await axios.get<IBlockStats | IRoundNumber>(
    isAlpha
      ? `${MONEY_BACKEND_URL}/block-height`
      : `${TOKENS_BACKEND_URL}/round-number`
  );

  if (isAlpha) {
    return BigInt((response.data as IBlockStats).blockHeight);
  } else {
    return BigInt((response.data as IRoundNumber).roundNumber);
  }
};

export const makeTransaction = async (
  data: ITransfer,
  pubKey?: string
): Promise<{ data: ITransfer }> => {
  const url = pubKey ? TOKENS_BACKEND_URL : MONEY_NODE_URL;
  const response = await axios.post<{ data: ITransfer | ISwapTransferProps }>(
    `${url}/transactions${pubKey ? "/" + pubKey : ''}`,
    {
      ...data,
    }
  );

  return response.data;
};
