import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import styled from "styled-components";
import Grid from "@material-ui/core/Grid";
import Select from "@material-ui/core/Select";
import InputBase from "@material-ui/core/InputBase";
import { useSnackbar } from "notistack";
import Editor from "./Editor";
import SimpleModal from "../../elements/Modal";

import { ButtonPro } from "../../elements/Button";
import AddInfoMessage from "../../elements/AddInfoMessage";
import * as actions from "../../../store/actions";
import {
  saveFileToIpfs,
  saveBufferToIpfs,
  sendTransaction,
  encodeWithPublicKey
} from "../../../helper";
import { AvatarPro } from "../../elements";
import MemoryTitle from './MemoryTitle';

const GrayLayout = styled.div`
  background: ${props => props.grayLayout && "rgba(0, 0, 0, 0.5)"};
  transition: background 0.3s ease;
  position: ${props => props.grayLayout && "fixed"};
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 1;
`;

const CreatePost = styled.div`
  position: relative;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: ${props => props.grayLayout && "2 !important"};
  margin-bottom: 24px;
`;
const ShadowBox = styled.div`
  padding: 30px;
  padding-bottom: 5px;
  border-radius: 5px;
  background: #fff;
  box-shadow: "0 1px 4px 0 rgba(0, 0, 0, 0.15)";
`;
const useStyles = makeStyles(theme => ({
  margin: {
    // margin: theme.spacing(1),
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 10
  },
  btShare: {
    width: 254,
    height: 46,
    borderRadius: 23
  },
  selectStyle: {
    minWidth: 110,
    height: 36,
    fontSize: 12,
    color: "#8250c8"
  },
  selectIcon: {
    width: 24,
    height: 24,
    color: "#8250c8",
    marginRight: theme.spacing(1)
  },
  btBox: {
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: "25px !important"
  },
  blogBtn: {
    color: "#8250c8",
    border: "1px solid #8250c8",
    padding: "10px 18px 11px 18px",
    boxSizing: "border-box",
    borderRadius: 23,
    height: 36,
    fontSize: 12,
    minWidth: 110,
    marginTop: 5,
    marginLeft: -50,
    outline: "none",
    cursor: "pointer"
  }
}));

const BootstrapInput = withStyles(theme => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(3)
    }
  },
  input: {
    borderRadius: 23,
    position: "relative",
    border: "1px solid #8250c8",
    padding: "10px 18px 11px 18px",
    boxSizing: "border-box",
    "&:focus": {
      borderRadius: 23,
      borderColor: "#8250c8"
    }
  }
}))(InputBase);

const BootstrapTextField = withStyles(theme => ({
  root: {
    fontSize: 16,
    paddingLeft: theme.spacing(1),
    borderColor: "#8250c8"
    // background: 'red',
  }
}))(InputBase);

export default function CreateMemory(props) {
  const { reLoadMemory, topInfo } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const layoutRef = React.createRef();

  const account = useSelector(state => state.account);
  const propose = useSelector(state => state.loveinfo.propose);
  const privateKey = useSelector(state => state.account.privateKey);
  const publicKey = useSelector(state => state.account.publicKey);

  const [filePath, setFilePath] = useState([]);
  const [memoryContent, setMemoryContent] = useState("");
  const [grayLayout, setGrayLayout] = useState(false);
  const [date, setDate] = useState(new Date());
  const [privacy, setPrivacy] = useState(0);
  const [disableShare, setDisableShare] = useState(true);
  const [isOpenModal, setOpenModal] = useState(false);
  const [editorContent, setEditorContent] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  function setGLoading(value) {
    dispatch(actions.setLoading(value));
  }

  function setNeedAuth(value) {
    dispatch(actions.setNeedAuth(value));
  }

  function memoryOnFocus() {
    if (!grayLayout) setGrayLayout(true);
  }
  function clickLayout(e) {
    if (e.target === layoutRef.current) setGrayLayout(false);
  }
  function memoryChange(e) {
    const { value } = e.target;
    if (value || filePath) {
      setDisableShare(false);
    } else {
      setDisableShare(true);
    }
    setMemoryContent(value);
  }
  function handleChangePrivacy(event) {
    setPrivacy(event.target.value);
  }
  function onChangeDate(value) {
    setDate(value);
  }

  function onChangeMedia(value) {
    if (value || memoryContent) {
      setDisableShare(false);
    } else {
      setDisableShare(true);
    }
    console.log("value", value);
    setFilePath(value);
  }

  async function onSubmitEditor(e) {
    let blocks = editorContent.blocks;
    for (let i in blocks) {
      if (blocks[i].type == "image") {
        let blob = await fetch(blocks[i].data.url).then(r => r.blob());
        let file = new File([blob], "name");
        let hash = await saveFileToIpfs([file]);
        blocks[i].data.url = process.env.REACT_APP_IPFS + hash;
      }
    }
    let buffer = Buffer.from(JSON.stringify({ ...editorContent }))
    let submitContent = await saveFileToIpfs([buffer])
    handleShareMemory(JSON.stringify({ ipfsHash: submitContent }));
  }

  function onChangeEditor(value) {
    setEditorContent(value);
  }

  async function handleShareMemory(advancedMemory) {
    if (!advancedMemory && !memoryContent && !filePath) {
      const message = "Please enter memory content or add a photo.";
      enqueueSnackbar(message, { variant: "error" });
      return;
    }

    const content = advancedMemory || memoryContent;

    if (!privateKey) {
      setNeedAuth(true);
      return;
    }

    setGLoading(true);
    setTimeout(async () => {
      const { proIndex } = props;
      // const hash = await saveFilesToIpfs(filePath);
      const hash = await saveBufferToIpfs(filePath);
      const info = { date, hash };
      let params = [];

      if (privacy) {
        const newContent = await encodeWithPublicKey(
          content,
          privateKey,
          publicKey
        );
        params = [proIndex, !!privacy, JSON.stringify(newContent), info];
      } else {
        params = [proIndex, !!privacy, content, info];
      }
      const method = "addMemory";
      const result = await sendTransaction(method, params);
      if (result) {
        reLoadMemory(proIndex);
      }
      setGLoading(false);
      setGrayLayout(false);
      setFilePath([]);
      setDate(new Date());
      setMemoryContent("");
      setPrivacy(0);
      setDisableShare(true);
      setOpenModal(false);
    }, 100);
  }

  return (
    <React.Fragment>
      <GrayLayout
        grayLayout={grayLayout}
        ref={layoutRef}
        onClick={clickLayout}
      />
      <CreatePost grayLayout={grayLayout}>
        <ShadowBox>
          <Grid container direction="column" spacing={3}>
            <Grid item>
              <Grid container wrap="nowrap" spacing={1}>
                <Grid item>
                  <AvatarPro
                    alt="img"
                    hash={account.avatar}
                    className={classes.avatar}
                  />
                </Grid>
                <Grid item xs={12}>
                  <BootstrapTextField
                    rows={3}
                    rowsMax={10}
                    fullWidth
                    multiline
                    value={memoryContent}
                    placeholder="Describe your Memory...."
                    onChange={memoryChange}
                    onFocus={memoryOnFocus}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <AddInfoMessage
                files={filePath}
                date={date}
                grayLayout={grayLayout}
                onChangeDate={onChangeDate}
                onChangeMedia={onChangeMedia}
              />
            </Grid>
            {grayLayout && (
              <Grid item classes={{ root: classes.btBox }}>
                <Select
                  native
                  value={privacy}
                  onChange={handleChangePrivacy}
                  classes={{
                    root: classes.selectStyle,
                    icon: classes.selectIcon
                  }}
                  input={
                    <BootstrapInput name="privacy" id="outlined-privacy" />
                  }
                >
                  <option value={0}>Public</option>
                  <option value={1}>Private</option>
                </Select>
                <button
                  onClick={() => setOpenModal(true)}
                  className={classes.blogBtn}
                >
                  Write blog...
                </button>
                <ButtonPro
                  type="submit"
                  isGrayout={disableShare}
                  onClick={() => {
                    handleShareMemory();
                  }}
                  className={classes.btShare}
                >
                  Share
                </ButtonPro>
              </Grid>
            )}
            <SimpleModal
              open={isOpenModal}
              handleClose={() => { setOpenModal(false); setGrayLayout(false) }}
              handleSumit={onSubmitEditor}
              closeText="Cancel"
              title={<MemoryTitle sender={topInfo.s_name} receiver={topInfo.r_name} />}
            >
              <Editor onChange={value => onChangeEditor(value)} />
            </SimpleModal>
          </Grid>
        </ShadowBox>
      </CreatePost>
    </React.Fragment>
  );
}
