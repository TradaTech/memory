import React from "react";
import styled from "styled-components";
import { FlexBox, FlexWidthBox, rem } from "../elements/Common";
import Icon from "src/components/elements/Icon";
// import { WithContext as ReactTags } from "react-tag-input";
import MessageHistory from "./MessageHistory";
import Promise from "./Promise";
import CustomPost from "./CustomPost";
import TopContrainer from "./TopContrainer";
import PromiseAlert from "./PromiseAlert";
import tweb3 from "../../service/tweb3";
import PromiseConfirm from "./PromiseConfirm";

const BannerContainer = styled.div`
  margin-bottom: ${rem(20)};
`;
const ShadowBox = styled.div`
  padding: 30px;
  border-radius: 10px;
  /* margin-bottom: 20px; */
  background: #ffffff;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
`;

const LeftBox = styled.div`
  width: 100%;
  min-height: ${rem(360)};
  i {
    padding: 0 5px;
  }
  .btn_add_promise {
    width: 172px;
    height: 46px;
    background: #ffffff;
    border-radius: 23px;
    font-weight: 600;
    color: #8250c8;
    border: 1px solid #8250c8;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
  }
  .title {
    color: #141927;
    font-weight: 600;
    font-size: ${rem(14)};
    text-transform: uppercase;
    margin-bottom: ${rem(20)};
  }
`;
const RightBox = styled.div`
  width: 100%;
  min-height: ${rem(360)};
  box-sizing: border-box;
  padding-left: ${rem(30)};
  .fl {
    float: left;
  }
  .fr {
    float: right;
  }
  .post_container {
    display: flex;
    width: 100%;
    .user_avatar {
      width: 58px;
      height: 58px;
      border-radius: 10px;
      overflow: hidden;
      margin-right: ${rem(10)};
    }
    .post_input {
      width: 100%;
      height: 50px;
      display: flex;
      align-items: center;
      .contentEditable {
        width: 200px;
        height: 19px;
        font-family: Montserrat;
        font-size: 16px;
        font-weight: 500;
        font-style: normal;
        font-stretch: normal;
        line-height: normal;
        letter-spacing: normal;
        color: #8f8f8f;
        outline: none;
        font-size: ${rem(16)};
      }
    }
  }
  .action {
    width: 100%;
    margin: 16px 0 16px;
    display: inline-block;
    .privacy {
      display: inline-block;
      float: left;
    }
    button {
      width: 254px;
      line-height: 46px;
      float: right;
      font-size: 16px;
      color: #ffffff;
      font-weight: 600;
      border-radius: 23px;
      box-shadow: 0 5px 14px 0 rgba(0, 0, 0, 0.06);
      background-image: -webkit-linear-gradient(118deg, #b276ff, #fe8dc3);
      background-image: linear-gradient(332deg, #b276ff, #fe8dc3);
    }
    .btn_post_policy {
      width: 102px;
      height: 36px;
      border-radius: 21px;
      background: #ffffff;
      border: 1px solid #8250c8;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Montserrat;
      font-size: 12px;
      font-weight: 500;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: normal;
      color: #8f36b3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
    }
  }
`;
const WarrperAcceptedPromise = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${rem(20)};
  :hover {
    cursor: pointer;
  }
  .icon {
    width: ${rem(36)};
    height: ${rem(36)};
    margin-right: ${rem(10)};
    border-radius: 50%;
    overflow: hidden;
  }
  .name {
    color: #5a5e67;
  }
  .nick {
    color: #8250c8;
    font-size: ${rem(12)};
  }
`;
const TagBox = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  .tagName {
    color: #8250c8;
    margin-right: ${rem(7)};
    font-size: ${rem(12)};
    :hover {
      cursor: pointer;
    }
  }
`;

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      promises: [
        { name: "Derrick Rogers", nick: "@derickrogers" },
        { name: "Jessie Guzman", nick: "@derickrogers" },
        { name: "Bertie Woods", nick: "@derickrogers" }
      ],
      tag: ["love", "travel", "honeymoon", "relax", "sweet"],
      ownerTag: ["honeymoon", "travel"],
      isPromise: false,
      isPendingPromise: false,
      isAccept: false,
      isDeny: false
    };
  }

  componentDidMount() {
    // this.loadPromise();
  }

  async loadPromise() {
    const address = process.env.contract;
    // const ct = tweb3.contract(address);
    console.log("view add", address);

    const params = process.env.address1;
    console.log("view params", params);
    const method = "callReadonlyContractMethod";
    const funcName = "getProposeByAddress";
    const result = await tweb3[method](address, funcName, params);
    // const method = this.id === 'read' ? 'callReadonlyContractMethod' : 'callPureContractMethod'
    // const result = await tweb3[method](address, name, params)
    console.log("view result", result);
  }

  renderPromise = () => {
    const { promises } = this.state;

    return promises.map((item, index) => {
      return (
        <WarrperAcceptedPromise key={index}>
          <div className="icon">
            <img src="https://trada.tech/assets/img/logo.svg" alt="echo_bot" />
          </div>
          <div className="pri_info">
            <div className="name">{item.name}</div>
            <div className="nick">{item.nick}</div>
          </div>
        </WarrperAcceptedPromise>
      );
    });
  };
  renderPendingPromise = () => {
    const { promises } = this.state;

    return promises.map((item, index) => {
      return (
        <WarrperAcceptedPromise key={index} onClick={this.openPendingPromise}>
          <div className="icon">
            <img src="https://trada.tech/assets/img/logo.svg" alt="echo_bot" />
          </div>
          <div className="pri_info">
            <div className="name" id={"pending" + index}>
              {item.name}
            </div>
            <div className="nick">{item.nick}</div>
          </div>
        </WarrperAcceptedPromise>
      );
    });
  };

  // async createPropose() {
  //   console.log("I am here");
  //   const ct = tweb3.contract(process.env.REACT_APP_CONTRACT);
  //   const { address } = tweb3.wallet.createAccount();
  //   const receiver = address;
  //   const name = "createPropose";
  //   const result = await ct.methods[name](receiver).sendCommit();
  // }

  renderTag = tag => {
    // const { tag } = this.state;

    return tag.map((item, index) => {
      return (
        <span className="tagName" key={index}>
          #{item}
        </span>
      );
    });
  };

  addPromise = () => {
    this.setState({ isPromise: true });
  };

  openPendingPromise = () => {
    this.setState({ isPendingPromise: true });
  };

  acceptPromise = () => {
    this.setState({ isAccept: true, isPendingPromise: false });
  };

  denyPromise = () => {
    this.setState({ isDeny: true, isPendingPromise: false });
  };

  closeConfirm = () => {
    this.setState({ isAccept: false, isDeny: false });
  };

  closePromise = () => {
    this.setState({ isPromise: false });
  };

  closePendingPromise = () => {
    this.setState({ isPendingPromise: false });
  };

  render() {
    const {
      tag,
      ownerTag,
      isPromise,
      isPendingPromise,
      isAccept,
      isDeny
    } = this.state;
    return (
      <main>
        <BannerContainer>
          <ShadowBox>
            <TopContrainer />
          </ShadowBox>
        </BannerContainer>

        <FlexBox wrap="wrap">
          <FlexWidthBox width="30%">
            <LeftBox>
              <ShadowBox>
                <button
                  type="button"
                  className="btn_add_promise"
                  onClick={this.addPromise}
                >
                  <Icon type="add" />
                  Add Promise
                </button>
                <div className="title">Accepted promise</div>
                <div>{this.renderPromise()}</div>
                <div className="title">Pending promise</div>
                <div>{this.renderPendingPromise()}</div>
                <div className="title">Popular Tag</div>
                <TagBox>{this.renderTag(tag)}</TagBox>
              </ShadowBox>
            </LeftBox>
          </FlexWidthBox>
          <FlexWidthBox width="70%">
            <RightBox>
              <div className="memorypost__content">
                <div className="post_container clearfix">
                  <div className="user_avatar">
                    <img src="/static/img/user-men.jpg" alt="itea" />
                  </div>
                  <div className="post_input fl">
                    <div className="contentEditable">
                      Describe your Memory….
                    </div>
                  </div>
                </div>
                <CustomPost avatarShow />
              </div>

              <div className="action">
                <div className="privacy">
                  <div className="css-1pcexqc-container privacy_select">
                    <div className="css-bg1rzq-control">
                      <div className="css-1hwfws3">
                        <div>
                          <button
                            type="button"
                            disabled=""
                            className="btn_post_policy"
                          >
                            Public
                            <div className="css-1wy0on6">
                              <span className="css-bgvzuu-indicatorSeparator" />
                              <div
                                aria-hidden="true"
                                className="css-16pqwjk-indicatorContainer"
                              >
                                <i className="material-icons">
                                  arrow_drop_down
                                </i>
                              </div>
                            </div>
                          </button>
                        </div>
                        {/* <input
                            id="react-select-2-input"
                            className="css-gj7qu5-dummyInput"
                          /> */}
                      </div>
                    </div>
                  </div>
                </div>
                <button type="button" disabled="">
                  Share
                </button>
              </div>
              <MessageHistory />
            </RightBox>
          </FlexWidthBox>
        </FlexBox>
        {isPromise && <Promise close={this.closePromise} />}
        {isPendingPromise && (
          <PromiseAlert
            close={this.closePendingPromise}
            accept={this.acceptPromise}
            deny={this.denyPromise}
          />
        )}
        {isAccept && <PromiseConfirm close={this.closeConfirm} />}
        {isDeny && <PromiseConfirm isDeny close={this.closeConfirm} />}
      </main>
    );
  }
}

export default Main;
