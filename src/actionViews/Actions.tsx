import { useState } from "react";
import classNames from "classnames";

import Button from "../components/Button/Button";
import { ReactComponent as Arrow } from "./../images/arrow.svg";
import { useApp } from "../hooks/appProvider";
import TransferFungible from "./components/TransferFungible";
import BillsList from "./components/BillsList/BillsList";
import AccountView from "./components/AccountView";
import { useAuth } from "../hooks/useAuth";
import TransferNFTs from "./components/TransferNFTs";
import Navbar from "../components/Navbar/Navbar";
import Spacer from "../components/Spacer/Spacer";
import AssetsList from "../components/AssetsList/AssetsList";
import {
  FungibleListView,
  NFTListView,
  NonFungibleTokenKind,
  ProfileView,
  TransferView,
} from "../utils/constants";

function Actions(): JSX.Element | null {
  const {
    isActionsViewVisible,
    setIsActionsViewVisible,
    actionsView,
    accounts,
    setSelectedTransferKey,
    NFTList,
  } = useApp();
  const { activeAsset } = useAuth();
  const [isFungibleActive, setIsFungibleActive] = useState<boolean>(
    activeAsset?.kind !== NonFungibleTokenKind
  );

  return (
    <div
      className={classNames("actions", { "is-visible": isActionsViewVisible })}
    >
      <div className="actions__header">
        <Button
          onClick={() => {
            setIsActionsViewVisible(!isActionsViewVisible);
            actionsView === TransferView && setSelectedTransferKey(null);
          }}
          className="btn__back"
          variant="icon"
        >
          <Arrow />
        </Button>
        <div className="actions__title">
          {actionsView === NFTListView || NFTListView
            ? activeAsset?.name || activeAsset?.symbol
            : actionsView}
        </div>
      </div>
      <div className="actions__view">
        {actionsView === TransferView && (
          <>
            <Spacer mt={8} />
            <Navbar
              isFungibleActive={
                isFungibleActive && activeAsset?.kind !== NonFungibleTokenKind
              }
              onChange={(v: boolean) => {
                setIsFungibleActive(v);
                setSelectedTransferKey(null);
              }}
            />
          </>
        )}
        {actionsView === TransferView ? (
          isFungibleActive && activeAsset?.kind !== NonFungibleTokenKind ? (
            <TransferFungible />
          ) : (
            <TransferNFTs />
          )
        ) : actionsView === FungibleListView ? (
          <BillsList />
        ) : actionsView === NFTListView ? (
          <>
            <Spacer mt={24} />
            <AssetsList
              isTypeListItem
              assetList={NFTList}
              isTransferButton
              isHoverDisabled
            />
          </>
        ) : actionsView === ProfileView && accounts ? (
          <AccountView />
        ) : (
          <></>
        )}
        <div className="actions__footer"></div>
      </div>
    </div>
  );
}

export default Actions;
