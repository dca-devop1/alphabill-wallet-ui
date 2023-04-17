import classNames from "classnames";
import { useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useQueryClient } from "react-query";

import Button from "../Button/Button";
import Spacer from "../Spacer/Spacer";
import { IAccount, IFungibleAsset } from "../../types/Types";
import { ReactComponent as CopyIco } from "../../images/copy-ico.svg";
import { ReactComponent as MoreIco } from "../../images/more-ico.svg";
import { ReactComponent as Sync } from "../../images/sync-ico.svg";
import { ReactComponent as Send } from "../../images/send-ico.svg";
import Popups from "./components/Popups";
import { useApp } from "../../hooks/appProvider";
import Spinner from "../Spinner/Spinner";
import { useAuth } from "../../hooks/useAuth";

import { invalidateAllLists, useDocumentClick } from "../../utils/utils";
import {
  AlphaType,
  ProfileView,
  TransferFungibleView,
} from "../../utils/constants";
import FungibleAssetsCol from "./components/FungibleAssetsCol";
import NFTAssetsCol from "./components/NFTAssetsCol";
import Navbar from "../Navbar/Navbar";

function Dashboard(): JSX.Element | null {
  const { activeAccountId, activeAsset, setActiveAssetLocal } = useAuth();
  const {
    setIsActionsViewVisible,
    setActionsView,
    account,
    accounts,
    setAccounts,
  } = useApp();
  const balance: string =
    account?.assets?.fungible?.find(
      (asset: IFungibleAsset) => asset.typeId === AlphaType
    )?.UIAmount || "";

  const balanceSizeClass =
    Number(balance?.length) > 7
      ? balance?.length > 12
        ? "x-small"
        : "small"
      : "";

  const [isFungibleActive, setIsFungibleActive] = useState<boolean>(true);
  const [isRenamePopupVisible, setIsRenamePopupVisible] = useState(false);
  const [isAccountSettingsVisible, setIsAccountSettingsVisible] =
    useState(false);
  const queryClient = useQueryClient();
  const popupRef = useRef<HTMLDivElement>(null);

  useDocumentClick(() => {
    isAccountSettingsVisible === true && setIsAccountSettingsVisible(false);
  }, popupRef);

  if (!accounts) {
    return (
      <div className="m-auto">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Spacer mb={48} />
      <div className="dashboard__balance">
        <div
          className={classNames("dashboard__balance-amount", balanceSizeClass)}
        >
          {balance || "0"}
        </div>
        <div
          className={classNames(
            "dashboard__balance-id t-ellipsis",
            balanceSizeClass
          )}
        >
          {AlphaType}
        </div>
      </div>
      <Spacer mb={32} />

      <div className="dashboard__account">
        <div className="dashboard__account-id">
          <span className="dashboard__account-name">{account?.name}</span>
          <span className="dashboard__account-id-item">
            {account?.name && "-"} {account?.pubKey}
          </span>
        </div>
        <div className="dashboard__account-buttons">
          <CopyToClipboard text={account?.pubKey || ""}>
            <Button
              id="copy-tooltip"
              tooltipContent="Key copied"
              variant="icon"
              className="copy-btn"
            >
              <CopyIco className="textfield__btn" height="12px" />
            </Button>
          </CopyToClipboard>
          <div className="p-rel" ref={popupRef}>
            <Button
              onClick={() =>
                setIsAccountSettingsVisible(!isAccountSettingsVisible)
              }
              variant="icon"
            >
              <MoreIco className="textfield__btn" height="12px" />
            </Button>
            <div
              className={classNames("dashboard__account-options", {
                active: isAccountSettingsVisible === true,
              })}
            >
              <div
                onClick={() => {
                  setIsRenamePopupVisible(!isRenamePopupVisible);
                  setIsAccountSettingsVisible(false);
                }}
                className="dashboard__account-option"
              >
                Rename
              </div>
              <div
                onClick={() => {
                  setActionsView(ProfileView);
                  setIsActionsViewVisible(true);
                  setIsAccountSettingsVisible(false);
                }}
                className="dashboard__account-option"
              >
                Change public key
              </div>
            </div>
          </div>
        </div>
      </div>
      <Spacer mb={8} />
      <div className="dashboard__buttons">
        <Button
          onClick={() =>
            invalidateAllLists(activeAccountId, activeAsset.typeId, queryClient)
          }
          variant="primary"
        >
          <Sync height="16" width="16" />
          <div className="pad-8-l">Refresh</div>
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setActionsView(TransferFungibleView);
            setActiveAssetLocal(
              JSON.stringify(
                account.assets.fungible.find(
                  (asset) => asset.typeId === AlphaType
                )
              )
            );
            setIsActionsViewVisible(true);
            invalidateAllLists(
              activeAccountId,
              activeAsset.typeId,
              queryClient
            );
          }}
        >
          <Send height="16" width="16" />
          <div className="pad-8-l">Transfer</div>
        </Button>
      </div>
      <Spacer mb={32} />
      <div className="dashboard__footer">
        <Navbar
          isFungibleActive={isFungibleActive}
          onChange={(v: boolean) => setIsFungibleActive(v)}
        />
        <div className="dashboard__info">
          {isFungibleActive === true ? <FungibleAssetsCol /> : <NFTAssetsCol />}
        </div>
      </div>
      <Popups
        accounts={accounts}
        account={account as IAccount}
        setAccounts={setAccounts}
        isRenamePopupVisible={isRenamePopupVisible}
        setIsRenamePopupVisible={setIsRenamePopupVisible}
      />
    </div>
  );
}

export default Dashboard;
