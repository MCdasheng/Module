/*
èªç¨å¤ä»½ Zhihu ð«AD
# !url =  https://raw.githubusercontent.com/MCdasheng/Module/main/Scripts/Zhihu_AdBlock.js
# @blackmatrix7
*/

const scriptName = "ç¥ä¹å©æ";
const blockedUsersKey = "zhihu_blocked_users";
const currentUserInfoKey = "zhihu_current_userinfo";
const keywordBlockKey = "zhihu_keyword_block";
// é»è®¤å±è½æ¨èåè¡¨çç¨æ·ï¼éå¸¸ä¸æ¯çå®ç¨æ·ï¼æ æ³éè¿å å¥é»ååå±è½
const defaultAnswerBlockedUsers = ["ä¼åæ¨è"];
const keywordMaxCount = 1000; // åè®¸è®¾ç½®çå³é®è¯æ°é
const $ = MagicJS(scriptName, "INFO");

(() => {
  let response = null;
  if ($.isResponse) {
    switch (true) {
      // ç¥ä¹8.3.0ç§»é¤æ¨èé¡µé¡¶é¨é¡¹
      case $.data.read("zhihu_settings_remove_sections", false) === true &&
        /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/feed-root\/sections\/query\/v2/.test(
          $.request.url
        ):
        response = removeFeedSections();
        break;
      // åç­åå®¹ä¼å
      case $.data.read("zhihu_settings_answer_tip", true) === true &&
        /^https?:\/\/(www\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/appview\/v2\/answer\/.*(entry=(?!(preload-topstory|preload-search|preload-subscription)))?/.test(
          $.request.url
        ):
        response = modifyAnswer();
        break;
      // å¤çç»å½ç¨æ·ä¿¡æ¯
      case /^https:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/people\/self$/.test(
        $.request.url
      ):
        response = processUserInfo();
        break;
      // é»ååå¢å¼º - æµè§é»ååç¨æ·ä¿¡æ¯æ¶èªå¨å å¥èæ¬é»åå
      case $.data.read("zhihu_settings_blocked_users", true) === true &&
        /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/people\/((?!self).)*$/.test(
          $.request.url
        ):
        response = autoInsertBlackList();
        break;
      // æ¨èå»å¹¿åä¸é»ååå¢å¼º
      case /^https:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/topstory\/recommend\?/.test(
        $.request.url
      ):
        response = removeRecommendAds();
        break;
      // å³æ³¨åè¡¨å»å¹¿å
      case /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/moments(\/|\?)?(recommend|action=|feed_type=)(?!\/people)/.test(
        $.request.url
      ):
        response = removeMomentsAds();
        break;
      // åç­åè¡¨å»å¹¿åä¸é»ååå¢å¼º
      case /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/(v4\/)?questions\/\d+/.test(
        $.request.url
      ):
        response = removeQuestionsAds();
        break;
      // ç¥ä¹V5çæ¬è¯è®ºå»å¹¿ååé»ååå¢å¼º
      case /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/comment_v5\/(answers|pins|comments?|articles)\/\d+\/(root|child)_comment/.test(
        $.request.url
      ):
        response = removeCommentV5Ads();
        break;
      // ç¥ä¹æ§çåç­ä¸­çè¯è®ºé»ååå¢å¼º
      case /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/(answers|pins|comments?|articles)\/\d+\/(root|child)_comments/.test(
        $.request.url
      ):
        response = removeCommentAds();
        break;
      // ç¥ä¹ç­æ¦å»å¹¿å
      case $.data.read("zhihu_settings_hot_list", true) === true &&
        /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/topstory\/hot-lists?(\?|\/)/.test(
          $.request.url
        ):
        response = removeHotListAds();
        break;
      // æ¦æªå®æ¹è´¦å·æ¨å¹¿æ¶æ¯
      case $.data.read("zhihu_settings_sys_msg", true) === true &&
        /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/notifications\/v3\/timeline\/entry\/system_message/.test(
          $.request.url
        ):
        response = removeSysMsgAds();
        break;
      // å±è½å®æ¹è¥éæ¶æ¯
      case $.data.read("zhihu_settings_sys_msg", true) != false &&
        /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/notifications\/v3\/message/.test(
          $.request.url
        ):
        response = removeMarketingMsg();
        break;
      // å»é¤é¢ç½®å³é®å­å¹¿å
      case $.data.read("zhihu_settings_preset_words", false) == true &&
        /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/search\/preset_words\?/.test(
          $.request.url
        ):
        response = removeKeywordAds();
        break;
      // ä¼åç¥ä¹è½¯ä»¶éç½®
      case $.data.read("zhihu_settings_app_conf") == true &&
        /^https?:\/\/appcloud2\.zhihu\.com\/v\d+\/config/.test($.request.url):
        response = modifyAppConfig();
        break;
      // ç¥ä¹ç­æå»å¹¿å
      case $.data.read("zhihu_settings_hot_search") == true &&
        /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/search\/top_search\/tabs\/hot\/items/.test(
          $.request.url
        ):
        response = removeHotSearchAds();
        break;
      // é»ååç®¡ç
      case $.data.read("zhihu_settings_blocked_users") != false &&
        /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/settings\/blocked_users/.test(
          $.request.url
        ):
        manageBlackUser();
        break;
      default:
        break;
    }
  } else if ($.isRequest) {
    // ç¥ä¹å±è½å³é®è¯è§£é
    if (
      $.data.read("zhihu_settings_blocked_keywords") != false &&
      /^https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/feed-root\/block/.test(
        $.request.url
      ) === true
    ) {
      response = unlockBlockedKeywords(response);
    }
  } else {
    $.data.del(currentUserInfoKey);
    $.data.del(blockedUsersKey);
    $.data.del(keywordBlockKey);
    $.notification.post("ç¥ä¹å©ææ°æ®æ¸çå®æ¯");
  }
  if (response) {
    $.done(response);
  } else {
    $.done();
  }
})();

/**
 * å±è½å®æ¹è¥éæ¶æ¯
 *
 * @param {*}
 * @return {*}
 */
function removeMarketingMsg() {
  let response = null;
  try {
    let obj = JSON.parse($.response.body);
    let newItems = [];
    for (let item of obj["data"]) {
      if (item["detail_title"] === "å®æ¹å¸å·æ¶æ¯") {
        let unread_count = item["unread_count"];
        if (unread_count > 0) {
          item["content"]["text"] = "æªè¯»æ¶æ¯" + unread_count + "æ¡";
        } else {
          item["content"]["text"] = "å¨é¨æ¶æ¯å·²è¯»";
        }
        item["is_read"] = true;
        item["unread_count"] = 0;
        newItems.push(item);
      } else if (item["detail_title"] !== "ç¥ä¹æ´»å¨å©æ") {
        newItems.push(item);
      }
    }
    obj["data"] = newItems;
    response = { body: JSON.stringify(obj) };
  } catch (err) {
    $.logger.error(`ç¥ä¹å±è½å®æ¹è¥éæ¶æ¯åºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 *  ç¥ä¹å±è½å³é®è¯è§£é
 *
 * @param {*}
 * @return {*}
 */
function unlockBlockedKeywords() {
  let response = null;
  try {
    const userInfo = getUserInfo();
    // è·åå±è½å³é®è¯åè¡¨
    if ($.request.method === "GET") {
      let keywords = $.data.read(keywordBlockKey, null, userInfo.id);
      if (!keywords) {
        keywords = [];
      }
      let headers = {
        "Cache-Control":
          "no-cache, no-store, must-revalidate, private, max-age=0",
        Connection: "keep-alive",
        "Content-Type": "application/json;charset=utf-8",
        Pragma: "no-cache",
        "Referrer-Policy": "no-referrer-when-downgrade",
        Server: "CLOUD ELB 1.0.0",
        Vary: "Accept-Encoding",
        "X-Cache-Lookup": "Cache Miss",
        "x-cdn-provider": "tencent",
      };
      let body = JSON.stringify({
        success: true,
        is_vip: true,
        kw_min_length: 2,
        kw_max_length: 100,
        kw_max_count: keywordMaxCount,
        data: keywords,
      });
      if ($.env.isQuanX) {
        response = { body: body, headers: headers, status: "HTTP/1.1 200 OK" };
      } else {
        response = { response: { body: body, headers: headers, status: 200 } };
      }
      $.logger.debug(`è·åæ¬å°èæ¬å±è½å³é®è¯ï¼\n${keywords.join("ã")}`);
    }

    // æ·»å å±è½å³é®è¯
    else if ($.request.method === "POST") {
      if (!!$.request.body) {
        // æé  response headers
        let headers = {
          "Cache-Control":
            "no-cache, no-store, must-revalidate, private, max-age=0",
          Connection: "keep-alive",
          "Content-Type": "application/json;charset=utf-8",
          Pragma: "no-cache",
          "Referrer-Policy": "no-referrer-when-downgrade",
          Server: "CLOUD ELB 1.0.0",
          Vary: "Accept-Encoding",
          "X-Cache-Lookup": "Cache Miss",
          "x-cdn-provider": "tencent",
        };
        // è¯»åå³é®è¯
        let keyword = decodeURIComponent($.request.body).match(
          /keyword=(.*)/
        )[1];
        let keywords = $.data.read(keywordBlockKey, null, userInfo.id);
        if (!keywords) {
          keywords = [];
        }
        // å¤æ­å³é®è¯æ¯å¦å­å¨
        let keywordExists = false;
        for (let i = 0; i < keywords.length; i++) {
          if (keyword === keywords[i]) {
            keywordExists = true;
            break;
          }
        }
        // ä¸å­å¨æ·»å ï¼å­å¨è¿åå¼å¸¸
        if (keywordExists === false) {
          keywords.push(keyword);
          $.data.write(keywordBlockKey, keywords, userInfo.id);
          let body = JSON.stringify({ success: true });
          if ($.env.isQuanX) {
            response = {
              body: body,
              headers: headers,
              status: "HTTP/1.1 200 OK",
            };
          } else {
            response = {
              response: { body: body, headers: headers, status: 200 },
            };
          }
          $.logger.debug(`æ·»å æ¬å°èæ¬å±è½å³é®è¯â${keyword}â`);
        } else {
          let body = JSON.stringify({
            error: {
              message: "å³é®è¯å·²å­å¨",
              code: 100002,
            },
          });
          if ($.env.isQuanX) {
            response = {
              body: body,
              headers: headers,
              status: "HTTP/1.1 400 Bad Request",
            };
          } else {
            response = {
              response: { body: body, headers: headers, status: 400 },
            };
          }
        }
      }
    }

    // å é¤å±è½å³é®è¯
    else if ($.request.method === "DELETE") {
      let keyword = decodeURIComponent($.request.url).match(/keyword=(.*)/)[1];
      let keywords = $.data.read(keywordBlockKey, null, userInfo.id);
      if (!keywords) {
        keywords = [];
      }
      keywords = keywords.filter((e) => {
        return e !== keyword;
      });
      $.data.write(keywordBlockKey, keywords, userInfo.id);
      let headers = {
        "Cache-Control":
          "no-cache, no-store, must-revalidate, private, max-age=0",
        Connection: "keep-alive",
        "Content-Type": "application/json;charset=utf-8",
        Pragma: "no-cache",
        "Referrer-Policy": "no-referrer-when-downgrade",
        Server: "CLOUD ELB 1.0.0",
        Vary: "Accept-Encoding",
        "X-Cache-Lookup": "Cache Miss",
        "x-cdn-provider": "tencent",
      };
      let body = JSON.stringify({ success: true });
      if ($.env.isQuanX) {
        response = { body: body, headers: headers, status: "HTTP/1.1 200 OK" };
      } else {
        response = { response: { body: body, headers: headers, status: 200 } };
      }
      $.logger.debug(`å é¤æ¬å°èæ¬å±è½å³é®è¯ï¼â${keyword}â`);
    }
  } catch (err) {
    $.logger.debug(`ç¥ä¹å³é®è¯å±è½æä½åºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * ç¥ä¹ç­æå»å¹¿å
 *
 * @param {*}
 * @return {*}
 */
function removeHotSearchAds() {
  let response = null;
  try {
    if (!!$.response.body) {
      let obj = JSON.parse($.response.body);
      obj["commercial_data"] = [];
      response = { body: JSON.stringify(obj) };
    }
  } catch (err) {
    $.logger.error(`å»é¤ç¥ä¹ç­æå¹¿ååºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * ä¼åç¥ä¹è½¯ä»¶éç½®
 *
 * @param {*}
 * @return {*}
 */
function modifyAppConfig() {
  let response = null;
  try {
    if (!!$.response.body) {
      let obj = JSON.parse($.response.body);
      let tab_infos = obj["config"]["homepage_feed_tab"]["tab_infos"].filter(
        (e) => {
          if (e.tab_type === "activity_tab") {
            e.end_time = (Date.parse(new Date()) - 120000)
              .toString()
              .substr(0, 10);
            return true;
          } else {
            return false;
          }
        }
      );
      obj["config"]["homepage_feed_tab"]["tab_infos"] = tab_infos;
      obj["config"]["zvideo_max_number"] = 1;
      // è¯çå»é¤ä¸äºéç½®ï¼ææå¾éªè¯
      delete obj["config"]["soso_des"];
      delete obj["config"]["cronet"];
      // å±è½ç¥ä¹8.Xçæ¬ä»¥ä¸æ¬å°DNSè§£æï¼ä»¥ä¸ä¿®æ¹ä¸æ¸æ¥åªäºæ¯ææçï¼ææ¶å¨é¨ä¿ç
      if (obj["config"].hasOwnProperty("zhcnh_thread_sync")) {
        $.logger.debug(JSON.stringify(obj["config"]["zhcnh_thread_sync"]));
        obj["config"]["zhcnh_thread_sync"]["LocalDNSSetHostWhiteList"] = [];
        obj["config"]["zhcnh_thread_sync"]["isOpenLocalDNS"] = "0";
        obj["config"]["zhcnh_thread_sync"]["ZHBackUpIP_Switch_Open"] = "0";
        obj["config"]["zhcnh_thread_sync"]["dns_ip_detector_operation_lock"] =
          "1";
        obj["config"]["zhcnh_thread_sync"][
          "ZHHTTPSessionManager_setupZHHTTPHeaderField"
        ] = "1";
      }
      response = { body: JSON.stringify(obj) };
    }
  } catch (err) {
    $.logger.error(`ä¼åç¥ä¹è½¯ä»¶éç½®åºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * å»é¤é¢ç½®å³é®å­å¹¿å
 *
 * @param {*}
 * @return {*}
 */
function removeKeywordAds() {
  let response = null;
  try {
    if (!!$.response.body) {
      $.logger.debug(`é¢ç½®å³é®å­è¿åï¼${$.response.body}`);
      let obj = JSON.parse($.response.body);
      if (obj.hasOwnProperty("preset_words") && obj["preset_words"]["words"]) {
        let words = obj["preset_words"]["words"].filter((element) => {
          return element["type"] !== "ad";
        });
        obj["preset_words"]["words"] = words;
        response = { body: JSON.stringify(obj) };
      }
    }
  } catch (err) {
    $.logger.error(`ç¥ä¹å»é¤é¢ç½®å³é®å­å¹¿ååºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * æ¦æªå®æ¹è´¦å·æ¨å¹¿æ¶æ¯
 *
 * @param {*}
 * @return {*}
 */
function removeSysMsgAds() {
  let response = null;
  try {
    const sysmsg_blacklist = [
      "ç¥ä¹å°ä¼ä¼´",
      "ç¥ä¹è§é¢",
      "ç¥ä¹å¢é",
      "ç¥ä¹ç¤¼å¸",
      "ç¥ä¹è¯»ä¹¦ä¼å¢é",
    ];
    let obj = JSON.parse($.response.body);
    let data = obj["data"].filter((element) => {
      return sysmsg_blacklist.indexOf(element["content"]["title"]) < 0;
    });
    obj["data"] = data;
    response = { body: JSON.stringify(obj) };
  } catch (err) {
    $.logger.error(`ç¥ä¹æ¦æªå®æ¹è´¦å·æ¨å¹¿æ¶æ¯åºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * ç¥ä¹ç­æ¦å»å¹¿å
 *
 * @param {*}
 * @return {*}
 */
function removeHotListAds() {
  let response = null;
  try {
    if (!!$.response.body) {
      let obj = JSON.parse($.response.body);
      if ("data" in obj) {
        let data = obj["data"].filter((e) => {
          return (
            e["type"] === "hot_list_feed" || e["type"] === "hot_list_feed_video"
          );
        });
        obj["data"] = data;
      }
      response = { body: JSON.stringify(obj) };
    }
  } catch (err) {
    $.logger.error(`å»é¤ç¥ä¹ç­æ¦å¹¿ååºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * ç¥ä¹æ§çåç­ä¸­çè¯è®ºé»ååå¢å¼º
 *
 * @param {*}
 * @return {*}
 */
function removeCommentAds() {
  let response = null;
  try {
    if (!!$.response.body) {
      // è¯è®ºåºå»å¹¿å
      let obj = JSON.parse($.response.body);
      if ($.data.read("zhihu_settings_blocked_users") != false) {
        // å±è½é»ååç¨æ·
        let user_info = getUserInfo();
        let customBlockedUsers = $.data.read(blockedUsersKey, "", user_info.id);
        let newData = [];
        obj.data.forEach((comment) => {
          // è¯è®ºäººæµç§°
          let commentUserName = comment.author.member.name;
          // åå¤åªä¸ªäººçè¯è®º(ä»éç¨äºç¬ç«å­è¯è®ºé¡µé¢è¯·æ±)
          let replyUserName = "";
          if (
            comment.reply_to_author &&
            comment.reply_to_author.member &&
            comment.reply_to_author.member.name
          ) {
            replyUserName = comment.reply_to_author.member.name;
          }
          if (
            customBlockedUsers[commentUserName] ||
            customBlockedUsers[replyUserName]
          ) {
            if (
              customBlockedUsers[commentUserName] &&
              !replyUserName &&
              $.request.url.indexOf("root_comment") > 0
            ) {
              $.notification.debug(
                `å±è½é»ååç¨æ·â${commentUserName}âçä¸»è¯è®ºã`
              );
            } else if (
              customBlockedUsers[commentUserName] &&
              !replyUserName &&
              $.request.url.indexOf("child_comment") > 0
            ) {
              $.notification.debug(
                `å±è½é»ååç¨æ·â${commentUserName}âçå­è¯è®ºã`
              );
            } else if (
              customBlockedUsers[commentUserName] &&
              replyUserName &&
              $.request.url.indexOf("child_comment") > 0
            ) {
              $.notification.debug(
                `å±è½é»ååç¨æ·â${commentUserName}âåå¤â${replyUserName}âçå­è¯è®ºã`
              );
            } else {
              $.notification.debug(
                `å±è½â${commentUserName}âåå¤é»ååç¨æ·â${replyUserName}âçå­è¯è®ºã`
              );
            }
            // åå°ä¸»è¯è®ºé¡µé¢ä¸­çè¯è®ºæ»æ°(ä»éç¨äºç¬ç«çä¸»è¯è®ºé¡µé¢è¯·æ±)
            if (obj.common_counts) {
              obj.common_counts -= 1;
            }
            // åå°å­è¯è®ºé¡µé¢ä¸­çè¯è®ºæ»æ°(ä»éç¨äºç¬ç«å­è¯è®ºé¡µé¢è¯·æ±)
            if (obj.paging && obj.paging.totals) {
              obj.paging.totals -= 1;
            }
          } else {
            // å±è½å­è¯è®ºä¸­çé»ååç¨æ·(ä»éç¨äºç¬ç«çä¸»è¯è®ºé¡µé¢è¯·æ±)
            if (comment.child_comments) {
              let newChildComments = [];
              comment.child_comments.forEach((childComment) => {
                if (
                  customBlockedUsers[childComment.author.member.name] ||
                  customBlockedUsers[childComment.reply_to_author.member.name]
                ) {
                  if (customBlockedUsers[childComment.author.member.name]) {
                    $.notification.debug(
                      `å±è½é»ååç¨æ·â${childComment.author.member.name}âçä¸»è¯è®ºã`
                    );
                  } else {
                    $.notification.debug(
                      `å±è½â${childComment.author.member.name}âåå¤é»ååç¨æ·â${childComment.reply_to_author.member.name}âçå­è¯è®ºã`
                    );
                  }
                  comment.child_comment_count -= 1;
                } else {
                  newChildComments.push(childComment);
                }
              });
              comment.child_comments = newChildComments;
            }
            newData.push(comment);
          }
        });
        obj.data = newData;
      }
      response = { body: JSON.stringify(obj) };
    }
  } catch (err) {
    $.logger.error(`å»é¤ç¥ä¹è¯è®ºå¹¿ååºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * ç¥ä¹V5çæ¬è¯è®ºå»å¹¿ååé»ååå¢å¼º
 *
 * @param {*}
 * @return {*}
 */
function removeCommentV5Ads() {
  let response = null;
  try {
    if (!!$.response.body) {
      let obj = JSON.parse($.response.body);
      obj["ad_info"] = {};
      // å±è½é»ååç¨æ·
      if ($.data.read("zhihu_settings_blocked_users") != false) {
        let user_info = getUserInfo();
        let customBlockedUsers = $.data.read(blockedUsersKey, "", user_info.id);
        customBlockedUsers = !!customBlockedUsers ? customBlockedUsers : {};
        let newComments = [];
        let blockCommentIdObj = {};
        obj.data.forEach((comment) => {
          // è¯è®ºäººæµç§°
          let commentUserName = comment.author.name;
          // åå¤åªä¸ªäººçè¯è®º(ä»éç¨äºç¬ç«å­è¯è®ºé¡µé¢è¯·æ±)
          let replyUserName = "";
          if (
            comment.reply_to_author &&
            comment.reply_to_author &&
            comment.reply_to_author.name
          ) {
            replyUserName = comment.reply_to_author.name;
          }
          if (
            customBlockedUsers[commentUserName] ||
            customBlockedUsers[replyUserName]
          ) {
            if (
              customBlockedUsers[commentUserName] &&
              !replyUserName &&
              $.request.url.indexOf("root_comment") > 0
            ) {
              $.notification.debug(
                `å±è½é»ååç¨æ·â${commentUserName}âçä¸»è¯è®ºã`
              );
            } else if (
              customBlockedUsers[commentUserName] &&
              !replyUserName &&
              $.request.url.indexOf("child_comment") > 0
            ) {
              $.notification.debug(
                `å±è½é»ååç¨æ·â${commentUserName}âçå­è¯è®ºã`
              );
            } else if (
              customBlockedUsers[commentUserName] &&
              replyUserName &&
              $.request.url.indexOf("child_comment") > 0
            ) {
              $.notification.debug(
                `å±è½é»ååç¨æ·â${commentUserName}âåå¤â${replyUserName}âçå­è¯è®ºã`
              );
            } else {
              $.notification.debug(
                `å±è½â${commentUserName}âåå¤é»ååç¨æ·â${replyUserName}âçå­è¯è®ºã`
              );
            }
            blockCommentIdObj[comment.id] = commentUserName;
            // ä¸»è¯è®ºæ°é-1ï¼ä»éç¨äºroot_commentä¸»è¯è®ºé¡µé¢è¯·æ±
            if (obj.counts && obj.counts.total_counts) {
              obj.counts.total_counts -= 1;
            }
            // å­è¯è®ºæ°é-1ï¼ä»éç¨äºchild_commentå­è¯è®ºé¡µé¢è¯·æ±
            if (obj.paging && obj.paging.totals) {
              obj.paging.totals -= 1;
            }
            if (obj.root && obj.root.child_comment_count) {
              obj.root.child_comment_count -= 1;
            }
          } else {
            if (comment.child_comments) {
              let newChildComments = [];
              comment.child_comments.forEach((childComment) => {
                let childCommentUserName = childComment.author.name;
                if (
                  customBlockedUsers[childCommentUserName] ||
                  blockCommentIdObj[childComment.reply_comment_id]
                ) {
                  if (customBlockedUsers[childCommentUserName]) {
                    $.notification.debug(
                      `å±è½é»ååç¨æ·â${childCommentUserName}âçå­è¯è®ºã`
                    );
                    blockCommentIdObj[childComment.id] = childCommentUserName;
                  } else {
                    $.notification.debug(
                      `å±è½â${childCommentUserName}âåå¤é»ååç¨æ·â${
                        blockCommentIdObj[childComment.reply_comment_id]
                      }âçå­è¯è®ºã`
                    );
                  }
                  comment.child_comment_count -= 1;
                } else {
                  newChildComments.push(childComment);
                }
              });
              comment.child_comments = newChildComments;
            }
            newComments.push(comment);
          }
        });
        obj.data = newComments;
      }
      response = { body: JSON.stringify(obj) };
    }
  } catch (err) {
    $.logger.error(`å»é¤ç¥ä¹è¯è®ºå¹¿ååºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * åç­åè¡¨å»å¹¿åä¸é»ååå¢å¼º
 *
 * @param {*}
 * @return {*}
 */
function removeQuestionsAds() {
  let response = null;
  try {
    const userInfo = getUserInfo();
    let customBlockedUsers = $.data.read(blockedUsersKey, "", userInfo.id);
    customBlockedUsers = !!customBlockedUsers ? customBlockedUsers : {};
    let obj = JSON.parse($.response.body);
    $.logger.debug(`å½åé»åååè¡¨: ${JSON.stringify(customBlockedUsers)}`);
    delete obj["ad_info"];
    delete obj["roundtable_info"];
    // å»é¤åç­åè¡¨ä¸­çé»ååç¨æ·
    if ("data" in obj) {
      delete obj["data"]["ad_info"];
      let data = obj.data["data"] || obj.data;
      data = data.filter((element) => {
        let blackUserName = "";
        try {
          if ("author" in element) {
            blackUserName = element["author"]["name"];
          } else if ("target" in element) {
            blackUserName = element["target"]["author"]["name"];
          }
        } catch (ex) {
          $.logger.error(`è·ååç­åè¡¨ç¨æ·ååºç°å¼å¸¸ï¼${err}`);
        }
        return blackUserName == "" || !customBlockedUsers[blackUserName];
      });
      if (obj.data.hasOwnProperty("data")) {
        obj.data["data"] = data;
      } else {
        obj["data"] = data;
      }
    }
    let body = JSON.stringify(obj);
    $.logger.debug(`ä¿®æ¹åçåç­åè¡¨æ°æ®ï¼${body}`);
    response = { body: body };
  } catch (err) {
    $.logger.error(`ç¥ä¹åç­åè¡¨å»å¹¿ååºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * å³æ³¨åè¡¨å»å¹¿å
 *
 * @param {*}
 * @return {*}
 */
function removeMomentsAds() {
  let response = null;
  try {
    let obj = JSON.parse(
      $.response.body.replace(/(\w+"+\s?):\s?(\d{15,})/g, '$1:"$2"')
    );
    const user_info = getUserInfo();
    let customBlockedUsers = $.data.read(blockedUsersKey, "", user_info.id);
    customBlockedUsers = !!customBlockedUsers ? customBlockedUsers : {};
    let data = [];

    const settings_moments_stream =
      $.data.read("zhihu_settings_moments_stream") == true;
    const settings_blocked_users =
      $.data.read("zhihu_settings_blocked_users") != false;

    for (let i = 0; i < obj["data"].length; i++) {
      // let element = targetIdFix(obj["data"][i]);
      let element = obj["data"][i];
      if (!element["ad"] && !element["adjson"] && !element["ad_list"]) {
        // å¤æ­è½¬åçæ³æ³æ¯å¦å«æé»ååç¨æ·
        if (
          settings_blocked_users &&
          element.target &&
          element.target.origin_pin &&
          element.target.origin_pin.author &&
          customBlockedUsers[element.target.origin_pin.author.name]
        ) {
          $.notification.debug(
            `å±è½â${element.target.author.name}âè½¬åé»ååç¨æ·â${element.target.origin_pin.author.name}âçæ³æ³ã`
          );
        }

        // å±è½å³æ³¨é¡µçâææ°è§é¢â
        else if (!settings_moments_stream || element["type"] != "videos") {
          data.push(element);
        }
      }
    }
    obj["data"] = data;
    response = { body: JSON.stringify(obj) };
  } catch (err) {
    $.logger.error(`ç¥ä¹å³æ³¨åè¡¨å»å¹¿ååºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * æ¨èå»å¹¿åä¸é»ååå¢å¼º
 *
 * @param {*}
 * @return {*}
 */
function removeRecommendAds() {
  let response = null;
  try {
    const settings_remove_yanxuan =
      $.data.read("zhihu_settings_remove_yanxuan") == true;
    const settings_recommend_stream =
      $.data.read("zhihu_settings_recommend_stream") == true;
    const settings_remove_article =
      $.data.read("zhihu_settings_remove_article") == true;
    // é»è®¤å¼å¯
    const settings_blocked_keywords =
      $.data.read("zhihu_settings_blocked_keywords") != false;
    const settings_blocked_users =
      $.data.read("zhihu_settings_blocked_users") != false;
    const user_info = getUserInfo();

    let keywords = $.data.read(keywordBlockKey, "", user_info.id);
    keywords = settings_blocked_keywords && !!keywords ? keywords : [];
    let customBlockedUsers = $.data.read(blockedUsersKey, "", user_info.id);
    customBlockedUsers =
      settings_blocked_users && !!customBlockedUsers ? customBlockedUsers : {};

    const dataFilter = (element) => {
      let elementStr = JSON.stringify(element);
      // æ¯å¦ä¸ºå¹¿å
      let isAd =
        element["card_type"] === "slot_event_card" ||
        element["card_type"] === "slot_video_event_card" ||
        element.hasOwnProperty("ad") ||
        // ç¥ä¹è®­ç»è¥
        (element["extra"] && element["extra"]["type"] === "Training");
      // æ¯å¦ä¸ºæµåªä½
      let isStream =
        isAd != true &&
        elementStr.search(
          /"(type|style)+"\s?:\s?"(drama|zvideo|Video|BIG_IMAGE)+"/i
        ) >= 0;
      let removeStream = isStream && settings_recommend_stream;
      // æ¯å¦ä¸ºæç« 
      let isArticle =
        elementStr.search(/"(type|style)+"\s?:\s?"article"/i) >= 0;
      let removeArticle = isArticle && settings_remove_article;
      // æ¯å¦å¹éèæ¬å³é®è¯è¿æ»¤
      let matchKeyword = false;
      if (isStream != true && settings_blocked_keywords) {
        for (let i = 0; i < keywords.length; i++) {
          if (elementStr.search(keywords[i]) >= 0) {
            if ($.isDebug) {
              let elementTitle =
                element.common_card.feed_content.title.panel_text;
              let elementContent =
                element.common_card.feed_content.content.panel_text;
              let actionUrl = "";
              try {
                actionUrl =
                  element.common_card.feed_content.title.action.intent_url;
              } catch {}
              $.logger.debug(
                `å¹éå³é®å­ï¼\n${keywords[i]}\næ é¢ï¼\n${elementTitle}\nåå®¹ï¼\n${elementContent}`
              );
              $.notification.debug(
                scriptName,
                `å³é®å­ï¼${keywords[i]}`,
                `${elementTitle}\n${elementContent}`,
                actionUrl
              );
            }
            matchKeyword = true;
            break;
          }
        }
      }
      // æ¯å¦ä¸ºé»ååç¨æ·
      let isBlockedUser = false;
      try {
        isBlockedUser =
          matchKeyword != true &&
          settings_blocked_users &&
          customBlockedUsers &&
          element["common_card"]["feed_content"]["source_line"]["elements"][1][
            "text"
          ]["panel_text"] in customBlockedUsers;
      } catch {
        isBlockedUser = false;
      }
      return !(
        isAd ||
        removeStream ||
        matchKeyword ||
        isBlockedUser ||
        removeArticle
      );
    };

    // ä¿®å¤numberç±»åç²¾åº¦ä¸¢å¤±
    let obj = JSON.parse(
      $.response.body.replace(/(\w+"+\s?):\s?(\d{15,})/g, '$1:"$2"')
    );
    obj["data"] = obj["data"].filter(dataFilter);
    response = { body: JSON.stringify(obj) };
  } catch (err) {
    $.logger.error(`ç¥ä¹æ¨èåè¡¨å»å¹¿ååºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * é»ååå¢å¼º - æµè§é»ååç¨æ·ä¿¡æ¯æ¶èªå¨å å¥èæ¬é»åå
 *
 * @param {*}
 * @return {*}
 */
function autoInsertBlackList() {
  let response = null;
  try {
    let obj = JSON.parse($.response.body);
    // å é¤MCNä¿¡æ¯
    delete obj["mcn_user_info"];
    response = { body: JSON.stringify(obj) };
    // å¦å·²æ¯é»ååç¨æ·ï¼ä½ä¸å¨èæ¬é»ååä¸­ï¼åèªå¨å å¥
    if (obj.name && obj.id && obj.is_blocking === true) {
      const userInfo = getUserInfo();
      let customBlockedUsers = $.data.read(blockedUsersKey, "", userInfo.id);
      customBlockedUsers =
        typeof customBlockedUsers === "object" && !!customBlockedUsers
          ? customBlockedUsers
          : {};
      if (!customBlockedUsers[obj.name]) {
        $.logger.debug(
          `å½åéè¦å å¥é»ååçç¨æ·Idï¼${obj["id"]}ï¼ç¨æ·åï¼${obj["name"]}`
        );
        customBlockedUsers[obj["name"]] = obj["id"];
        $.data.write(blockedUsersKey, customBlockedUsers, userInfo.id);
        $.logger.debug(
          `${
            obj["name"]
          }åå¥èæ¬é»ååæåï¼å½åèæ¬é»ååæ°æ®ï¼${JSON.stringify(
            customBlockedUsers
          )}`
        );
        $.notification.post(`å·²èªå¨å°ç¨æ·â${obj["name"]}âåå¥èæ¬é»ååã`);
      }
    }
  } catch (err) {
    $.logger.error(`ç¥ä¹å»é¤MCNä¿¡æ¯åºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * å¤çç»å½ç¨æ·ä¿¡æ¯
 *
 * @param {*}
 * @return {*}
 */
function processUserInfo() {
  let response = null;
  try {
    let obj = JSON.parse($.response.body);
    $.logger.debug(`ç¨æ·ç»å½ç¨æ·ä¿¡æ¯ï¼æ¥å£ååºï¼${$.response.body}`);
    if (
      obj &&
      obj["id"] &&
      obj.hasOwnProperty("vip_info") &&
      obj["vip_info"].hasOwnProperty("is_vip")
    ) {
      const userInfo = {
        id: obj["id"],
        is_vip: obj["vip_info"]["is_vip"]
          ? obj["vip_info"]["is_vip"] !== undefined
          : false,
      };
      $.logger.debug(
        `å½åç¨æ·idï¼${obj["id"]}ï¼æ¯å¦ä¸ºVIPï¼${obj["vip_info"]["is_vip"]}`
      );
      $.data.write(currentUserInfoKey, userInfo);
      // å¨ç¥ä¹APPæ¾ç¤ºVIPï¼ä»èªå·±å¯è§ï¼æå¼åæè½ä½¿ç¨å±è½å³é®è¯è§£é
      if (
        $.data.read("zhihu_settings_fake_vip") != false &&
        obj["vip_info"]["is_vip"] === false
      ) {
        obj["vip_info"]["is_vip"] = true;
        obj["vip_info"]["vip_icon"] = {
          url: "https://pic1.zhimg.com/v2-4812630bc27d642f7cafcd6cdeca3d7a_r.png",
          night_mode_url:
            "https://pic1.zhimg.com/v2-c9686ff064ea3579730756ac6c289978_r.png",
        };
        obj["vip_info"]["entrance"] = {
          icon: {
            url: "https://pic1.zhimg.com/v2-5b7012c8c22fd520f5677305e1e551bf.png",
            night_mode_url:
              "https://pic1.zhimg.com/v2-e51e3252d7a2cb016a70879defd5da0b.png",
          },
          title: "æççéä¼å",
          expires_day: "2033-12-24",
          sub_title: null,
          button_text: "ä½ å¥½ï¼ç¥ä¹ï¼",
          jump_url: "zhihu://vip/purchase",
          button_jump_url: "zhihu://vip/purchase",
          sub_title_new: null,
          identity: "svip",
        };
        obj["vip_info"]["entrance_new"] = {
          left_button: {
            title: "ç²¾éä¼ååå®¹",
            description: "ä¸ºæ¨ä¸¥éå¥½åå®¹",
            jump_url: "zhihu://market/home",
          },
          right_button: {
            title: "æççéä¼å",
            description: "çäº« 10w+ ä¼è´¨åå®¹",
            jump_url: "zhihu://vip/my",
          },
        };
        obj["vip_info"]["entrance_v2"] = {
          title: "æççéä¼å",
          sub_title: "çäº« 10w+ ä¼è´¨åå®¹",
          jump_url: "zhihu://vip/my",
          button_text: "æ¥çæç",
        };
        response = { body: JSON.stringify(obj) };
      }
    } else {
      $.logger.warning(
        `æ²¡æè·åå°æ¬æ¬¡ç»å½ç¨æ·ä¿¡æ¯ï¼å¦æªå¯¹åè½é æå½±åï¼è¯·å¿½ç¥æ­¤æ¥å¿ã`
      );
    }
  } catch (err) {
    $.logger.error(`ç¥ä¹è·åå½åç¨æ·ä¿¡æ¯åºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * åç­åå®¹ä¼å
 *
 * @param {*}
 * @return {*}
 */
function modifyAnswer() {
  let response = null;
  try {
    let html = $.response.body;
    // ä»è´¹åå®¹æé
    if (
      (html.indexOf("æ¥çå®æ´åå®¹") >= 0 ||
        html.indexOf("æ¥çå¨é¨ç« è") >= 0) &&
      html.indexOf("paid") >= 0
    ) {
      let matchStr = html.match(/(richText[^<]*>)(.)/)[1];
      let start = html.lastIndexOf(matchStr) + matchStr.length;
      let insertText =
        '<a style="height: 42px;padding: 0 12px;border-radius: 6px;background-color: rgb(247 104 104 / 8%);display: block;text-decoration: none;" href="#"><div style="color: #f36;display: flex;-webkit-box-align: center;align-items: center;height: 100%;"><svg style="width: 1.2em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1957"><path d="M821.333333 138.666667c64.8 0 117.333333 52.533333 117.333334 117.333333v149.333333a32 32 0 0 1-32 32 74.666667 74.666667 0 0 0 0 149.333334 32 32 0 0 1 32 32v149.333333c0 64.8-52.533333 117.333333-117.333334 117.333333H202.666667c-64.8 0-117.333333-52.533333-117.333334-117.333333V618.666667a32 32 0 0 1 32-32 74.666667 74.666667 0 0 0 0-149.333334 32 32 0 0 1-32-32V256c0-64.8 52.533333-117.333333 117.333334-117.333333h618.666666zM428.576 329.994667a32 32 0 0 0-43.733333-2.581334l-1.514667 1.344a32 32 0 0 0-2.581333 43.733334L452.565333 458.666667H405.333333l-1.877333 0.053333A32 32 0 0 0 373.333333 490.666667l0.053334 1.877333A32 32 0 0 0 405.333333 522.666667h80v42.666666H405.333333l-1.877333 0.053334A32 32 0 0 0 373.333333 597.333333l0.053334 1.877334A32 32 0 0 0 405.333333 629.333333h80v42.666667l0.053334 1.877333A32 32 0 0 0 517.333333 704l1.877334-0.053333A32 32 0 0 0 549.333333 672v-42.666667H618.666667l1.877333-0.053333A32 32 0 0 0 650.666667 597.333333l-0.053334-1.877333A32 32 0 0 0 618.666667 565.333333h-69.333334v-42.666666H618.666667l1.877333-0.053334A32 32 0 0 0 650.666667 490.666667l-0.053334-1.877334A32 32 0 0 0 618.666667 458.666667h-47.253334l71.84-86.186667 1.248-1.589333a32 32 0 0 0-50.421333-39.381334L512 430.016l-82.08-98.506667z" p-id="1958"></path></svg><div style="flex: 1 1;white-space: nowrap;text-overflow: ellipsis;padding-left:4px"><span style="font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;-webkit-tap-highlight-color: rgba(26,26,26,0);font-size: 14px;line-height: 20px;color: #f36;white-space: nowrap;font-weight: 600;">ç¥ä¹å©æ Â· æ¬æä¸ºä»è´¹åå®¹</span></div><div><span style="font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;-webkit-tap-highlight-color: rgba(26,26,26,0);font-size: 14px;color: #f36;line-height: normal;display: flex;-webkit-box-align: center;align-items: center;"><svg style="font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;-webkit-tap-highlight-color: rgba(26,26,26,0);font-size: 14px;color: #f36;line-height: normal;fill: currentcolor;width: 24px;height: 24px;margin: -2px;" fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M9.218 16.78a.737.737 0 0 0 1.052 0l4.512-4.249a.758.758 0 0 0 0-1.063L10.27 7.22a.737.737 0 0 0-1.052 0 .759.759 0 0 0-.001 1.063L13 12l-3.782 3.716a.758.758 0 0 0 0 1.063z" fill-rule="evenodd"></path></svg></span></div></div></a>';
      response = {
        body: html.slice(0, start) + insertText + html.slice(start),
      };
    }

    // è¥éæ¨å¹¿æé
    else if (
      html.indexOf("ad-link-card") >= 0 ||
      html.indexOf("xg.zhihu.com") >= 0 ||
      html.indexOf("ç¥ä¹è¥éå¹³å°") >= 0
    ) {
      let matchStr = html.match(/(richText[^<]*>)(.)/)[1];
      let start = html.lastIndexOf(matchStr) + matchStr.length;
      let insertText =
        '<a style="height: 42px;padding: 0 12px;border-radius: 6px;background-color: rgb(8 188 212 / 8%);display: block;text-decoration: none;" href="#"><div style="color: #00bcd4;display: flex;-webkit-box-align: center;align-items: center;height: 100%;"><svg style="width: 1.2em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1957"><path d="M128 765.952q0 26.624 18.432 45.056t45.056 18.432l191.488 0 0 128-254.976 0q-26.624 0-49.664-10.24t-40.448-27.648-27.648-40.448-10.24-49.664l0-637.952q0-25.6 10.24-49.152t27.648-40.448 40.448-27.136 49.664-10.24l701.44 0q26.624 0 49.664 10.24t40.448 27.136 27.648 40.448 10.24 49.152l0 251.904-128 1.024 0-61.44q0-26.624-18.432-45.056t-45.056-18.432l-574.464 0q-26.624 0-45.056 18.432t-18.432 45.056l0 382.976zM990.208 705.536q21.504 18.432 22.016 34.304t-20.992 33.28q-21.504 18.432-51.2 41.472t-60.928 48.128-61.952 49.152-55.296 43.52q-26.624 20.48-43.52 15.36t-16.896-31.744q1.024-16.384 0-40.448t-1.024-41.472q0-19.456-10.752-24.064t-31.232-4.608q-21.504 0-39.936-0.512t-35.84-0.512-36.352-0.512-41.472-0.512q-9.216 0-19.968-2.048t-19.456-7.168-14.336-15.36-5.632-27.648l0-80.896q0-31.744 15.36-42.496t48.128-10.752q30.72 1.024 61.44 1.024t71.68 1.024q29.696 0 46.08-5.12t16.384-25.6q-1.024-14.336 0.512-35.328t1.536-37.376q0-26.624 14.336-33.28t36.864 10.752q22.528 18.432 52.736 43.008t61.952 50.688 62.976 51.2 54.784 44.544z" p-id="5859"></path></svg><div style="flex: 1 1;white-space: nowrap;text-overflow: ellipsis;padding-left:4px"><span style="font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;-webkit-tap-highlight-color: rgba(26,26,26,0);font-size: 14px;line-height: 20px;color: #00bcd4;white-space: nowrap;font-weight: 600;">ç¥ä¹å©æ Â· æ¬æå«æè¥éæ¨å¹¿</span></div><div><span style="font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;-webkit-tap-highlight-color: rgba(26,26,26,0);font-size: 14px;color: #f36;line-height: normal;display: flex;-webkit-box-align: center;align-items: center;"><svg style="font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;-webkit-tap-highlight-color: rgba(26,26,26,0);font-size: 14px;color: #00BCD4;line-height: normal;fill: currentcolor;width: 24px;height: 24px;margin: -2px;" fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M9.218 16.78a.737.737 0 0 0 1.052 0l4.512-4.249a.758.758 0 0 0 0-1.063L10.27 7.22a.737.737 0 0 0-1.052 0 .759.759 0 0 0-.001 1.063L13 12l-3.782 3.716a.758.758 0 0 0 0 1.063z" fill-rule="evenodd"></path></svg></span></div></div></a>';
      response = {
        body: html.slice(0, start) + insertText + html.slice(start),
      };
    }

    // è´­ç©æ¨å¹¿æé
    else if (html.indexOf("mcn-link-card") >= 0) {
      let matchStr = html.match(/(richText[^<]*>)(.)/)[1];
      let start = html.lastIndexOf(matchStr) + matchStr.length;
      let insertText =
        '<a style="height: 42px;padding: 0 12px;border-radius: 6px;background-color: rgb(8 188 212 / 8%);display: block;text-decoration: none;" href="#"><div style="color: #00bcd4;display: flex;-webkit-box-align: center;align-items: center;height: 100%;"><svg style="width: 1.2em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1957"><path d="M346.112 806.912q19.456 0 36.864 7.168t30.208 19.968 20.48 30.208 7.68 36.864-7.68 36.864-20.48 30.208-30.208 20.48-36.864 7.68q-20.48 0-37.888-7.68t-30.208-20.48-20.48-30.208-7.68-36.864 7.68-36.864 20.48-30.208 30.208-19.968 37.888-7.168zM772.096 808.96q19.456 0 37.376 7.168t30.72 19.968 20.48 30.208 7.68 36.864-7.68 36.864-20.48 30.208-30.72 20.48-37.376 7.68-36.864-7.68-30.208-20.48-20.48-30.208-7.68-36.864 7.68-36.864 20.48-30.208 30.208-19.968 36.864-7.168zM944.128 227.328q28.672 0 44.544 7.68t22.528 18.944 6.144 24.064-3.584 22.016-13.312 37.888-22.016 62.976-23.552 68.096-18.944 53.248q-13.312 40.96-33.28 56.832t-49.664 15.872l-35.84 0-65.536 0-86.016 0-96.256 0-253.952 0 14.336 92.16 517.12 0q49.152 0 49.152 41.984 0 20.48-9.728 35.328t-38.4 14.848l-49.152 0-94.208 0-118.784 0-119.808 0-99.328 0-55.296 0q-20.48 0-34.304-9.216t-23.04-24.064-14.848-32.256-8.704-32.768q-1.024-6.144-5.632-29.696t-11.264-58.88-14.848-78.848-16.384-87.552q-19.456-103.424-44.032-230.4l-76.8 0q-15.36 0-25.6-7.68t-16.896-18.432-9.216-23.04-2.56-22.528q0-20.48 13.824-33.792t37.376-13.312l21.504 0 21.504 0 25.6 0 34.816 0q20.48 0 32.768 6.144t19.456 15.36 10.24 19.456 5.12 17.408q2.048 8.192 4.096 23.04t4.096 30.208q3.072 18.432 6.144 38.912l700.416 0zM867.328 194.56l-374.784 0 135.168-135.168q23.552-23.552 51.712-24.064t51.712 23.04z"></path></svg><div style="flex: 1 1;white-space: nowrap;text-overflow: ellipsis;padding-left:4px"><span style="font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;-webkit-tap-highlight-color: rgba(26,26,26,0);font-size: 14px;line-height: 20px;color: #00bcd4;white-space: nowrap;font-weight: 600;">ç¥ä¹å©æ Â· æ¬æå«æè´­ç©æ¨å¹¿</span></div><div><span style="font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;-webkit-tap-highlight-color: rgba(26,26,26,0);font-size: 14px;color: #f36;line-height: normal;display: flex;-webkit-box-align: center;align-items: center;"><svg style="font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;-webkit-tap-highlight-color: rgba(26,26,26,0);font-size: 14px;color: #00BCD4;line-height: normal;fill: currentcolor;width: 24px;height: 24px;margin: -2px;" fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M9.218 16.78a.737.737 0 0 0 1.052 0l4.512-4.249a.758.758 0 0 0 0-1.063L10.27 7.22a.737.737 0 0 0-1.052 0 .759.759 0 0 0-.001 1.063L13 12l-3.782 3.716a.758.758 0 0 0 0 1.063z" fill-rule="evenodd"></path></svg></span></div></div></a>';
      response = {
        body: html.slice(0, start) + insertText + html.slice(start),
      };
    }

    // å½©è
    else if (Math.floor(Math.random() * 200) == 7) {
      let matchStr = html.match(/(richText[^<]*>)(.)/)[1];
      let start = html.lastIndexOf(matchStr) + matchStr.length;
      let insertText =
        '<a style="height: 42px;padding: 0 12px;border-radius: 6px;background-color: rgb(74 162 56 / 8%);display: block;text-decoration: none;" href="#"><div style="color: #619201;display: flex;-webkit-box-align: center;align-items: center;height: 100%;"><svg class="icon" style="width: 1.2em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1465"><path d="M512 85.333333c71.477333 0 159.68 57.546667 229.258667 147.018667C817.845333 330.826667 864 455.978667 864 586.666667c0 211.808-148.501333 352-352 352S160 798.474667 160 586.666667c0-130.688 46.144-255.84 122.741333-354.314667C352.32 142.88 440.522667 85.333333 512 85.333333z m0 64c-48.213333 0-120.096 46.912-178.741333 122.314667C265.109333 359.253333 224 470.762667 224 586.666667c0 175.616 119.050667 288 288 288s288-112.384 288-288c0-115.904-41.109333-227.402667-109.258667-315.018667C632.096 196.234667 560.213333 149.333333 512 149.333333z m-74.666667 522.666667a53.333333 53.333333 0 1 1 0 106.666667 53.333333 53.333333 0 0 1 0-106.666667z m-96-128a42.666667 42.666667 0 1 1 0 85.333333 42.666667 42.666667 0 0 1 0-85.333333z" p-id="1466"></path></svg><div style="flex: 1 1;white-space: nowrap;text-overflow: ellipsis;padding-left:4px"><span style="font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;-webkit-tap-highlight-color: rgba(26,26,26,0);font-size: 14px;line-height: 20px;color: #619201;white-space: nowrap;font-weight: 600;">ç¥ä¹å©æ Â· æ¬æä¸ºåè´¹åå®¹</span></div><div><span style="font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;-webkit-tap-highlight-color: rgba(26,26,26,0);font-size: 14px;color: #619201;line-height: normal;display: flex;-webkit-box-align: center;align-items: center;"><svg style="font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;-webkit-tap-highlight-color: rgba(26,26,26,0);font-size: 14px;color: #619201;line-height: normal;fill: currentcolor;width: 24px;height: 24px;margin: -2px;" fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M9.218 16.78a.737.737 0 0 0 1.052 0l4.512-4.249a.758.758 0 0 0 0-1.063L10.27 7.22a.737.737 0 0 0-1.052 0 .759.759 0 0 0-.001 1.063L13 12l-3.782 3.716a.758.758 0 0 0 0 1.063z" fill-rule="evenodd"></path></svg></span></div></div></a>';
      response = {
        body: html.slice(0, start) + insertText + html.slice(start),
      };
    }
  } catch (err) {
    $.logger.error(`ç¥ä¹ä»è´¹åå®¹æéåºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

/**
 * @description: é»ååç®¡ç
 * @param {*}
 * @return {*}
 */
function manageBlackUser() {
  const userInfo = getUserInfo();
  let defaultBlockedUsers = {};
  let customBlockedUsers = $.data.read(blockedUsersKey, "", userInfo.id);
  customBlockedUsers =
    typeof customBlockedUsers === "object" && !!customBlockedUsers
      ? customBlockedUsers
      : {};
  defaultAnswerBlockedUsers.forEach((element) => {
    customBlockedUsers[element] = "00000000000000000000000000000000";
    defaultBlockedUsers[element] = "00000000000000000000000000000000";
  });
  $.logger.debug(
    `å½åç¨æ·idï¼${userInfo.id}ï¼èæ¬é»ååï¼${JSON.stringify(
      customBlockedUsers
    )}`
  );
  // è·åé»åå
  if ($.request.method == "GET") {
    try {
      // å è½½é»ååé¦é¡µæ¶ï¼æ¸ç©ºåå²é»ååï¼ä»ä¿çèæ¬é»è®¤é»åå
      if ($.request.url.indexOf("offset") < 0) {
        customBlockedUsers = defaultBlockedUsers;
        $.logger.debug("èæ¬é»ååå·²æ¸ç©ºï¼è¯·æ»å¨è³é»ååæ«å°¾ä¿è¯éæ°è·åå®æã");
        $.notification.post(
          "èæ¬é»ååå·²æ¸ç©ºï¼è¯·æ»å¨è³é»ååæ«å°¾ä¿è¯éæ°è·åå®æã"
        );
      }
      let obj = JSON.parse($.response.body);
      if (!!obj["data"]) {
        $.logger.debug(`æ¬æ¬¡æ»å¨è·åçé»ååä¿¡æ¯ï¼${JSON.stringify(obj["data"])}`);
        obj["data"].forEach((element) => {
          if (element["name"] != "[å·²éç½®]") {
            customBlockedUsers[element["name"]] = element["id"];
          }
        });
        $.data.write(blockedUsersKey, customBlockedUsers, userInfo.id);
        if (obj["paging"]["is_end"] == true) {
          $.notification.post(
            `è·åèæ¬é»ååç»æï¼å½åé»ååå±${
              Object.keys(customBlockedUsers).length -
              defaultAnswerBlockedUsers.length
            }äººã\nèæ¬åç½®é»åå${defaultAnswerBlockedUsers.length}äººã`
          );
          $.logger.debug(`èæ¬é»åååå®¹ï¼${JSON.stringify(customBlockedUsers)}ã`);
        }
      } else {
        $.logger.warning(`è·åé»ååå¤±è´¥ï¼æ¥å£ååºä¸åæ³ï¼${$.response.body}`);
      }
    } catch (err) {
      $.data.del(blockedUsersKey);
      $.logger.error(`è·åé»ååå¤±è´¥ï¼å¼å¸¸ä¿¡æ¯ï¼${err}`);
      $.notification.post("è·åé»ååå¤±è´¥ï¼æ§è¡å¼å¸¸ï¼å·²æ¸ç©ºé»ååã");
    }
  }
  // åå¥é»åå
  else if ($.request.method == "POST") {
    try {
      let obj = JSON.parse($.response.body);
      if (obj.hasOwnProperty("name") && obj.hasOwnProperty("id")) {
        $.logger.debug(
          `å½åéè¦å å¥é»ååçç¨æ·Idï¼${obj["id"]}ï¼ç¨æ·åï¼${obj["name"]}`
        );
        if (obj["id"]) {
          customBlockedUsers[obj["name"]] = obj["id"];
          $.data.write(blockedUsersKey, customBlockedUsers, userInfo.id);
          $.logger.debug(
            `${
              obj["name"]
            }åå¥èæ¬é»ååæåï¼å½åèæ¬é»ååæ°æ®ï¼${JSON.stringify(
              customBlockedUsers
            )}`
          );
          $.notification.post(`å·²å°ç¨æ·â${obj["name"]}âåå¥èæ¬é»ååã`);
        } else {
          $.logger.error(`${obj["name"]}åå¥èæ¬é»ååå¤±è´¥ï¼æ²¡æè·åå°ç¨æ·Idã`);
          $.notification.post(`å°ç¨æ·â${obj["name"]}âåå¥èæ¬é»ååå¤±è´¥ï¼`);
        }
      } else {
        $.logger.warning(`åå¥é»ååå¤±è´¥ï¼æ¥å£ååºä¸åæ³ï¼${$.response.body}`);
        $.notification.post("åå¥èæ¬é»ååå¤±è´¥ï¼æ¥å£è¿åä¸åæ³ã");
      }
    } catch (err) {
      $.logger.error(`åå¥é»ååå¤±è´¥ï¼å¼å¸¸ä¿¡æ¯ï¼${err}`);
      $.notification.post("åå¥èæ¬é»ååå¤±è´¥ï¼æ§è¡å¼å¸¸ï¼è¯·æ¥éæ¥å¿ã");
    }
  }
  // ç§»åºé»åå
  else if ($.request.method == "DELETE") {
    try {
      let obj = JSON.parse($.response.body);
      if (obj.success) {
        let user_id = $.request.url.match(
          /https?:\/\/(api\.zhihu\.com|(103\.41\.167\.(226|234|235|236)))\/settings\/blocked_users\/([0-9a-zA-Z]*)/
        )[1];
        if (user_id) {
          $.logger.debug(`å½åéè¦ç§»åºé»ååçç¨æ·Idï¼${user_id}`);
          for (let username in customBlockedUsers) {
            if (customBlockedUsers[username] == user_id) {
              delete customBlockedUsers[username];
              $.data.write(blockedUsersKey, customBlockedUsers, userInfo.id);
              $.logger.debug(
                `${username}ç§»åºèæ¬é»ååæåï¼å½åèæ¬é»ååæ°æ®ï¼${JSON.stringify(
                  customBlockedUsers
                )}`
              );
              $.notification.post(`å·²å°ç¨æ·â${username}âç§»åºèæ¬é»ååï¼`);
              break;
            }
          }
        } else {
          $.logger.error(
            "å°ç¨æ·ç§»åºèæ¬é»ååå¤±è´¥ï¼\nå»ºè®®ä»è®¾ç½®ä¸­å·æ°é»ååæ°æ®ã"
          );
          $.notification.post(
            `å°ç¨æ·ç§»åºèæ¬é»ååå¤±è´¥ï¼æ²¡æè·åå°ç¨æ·Idã\nå»ºè®®ä»è®¾ç½®ä¸­å·æ°é»ååæ°æ®ã`
          );
        }
      } else {
        $.logger.warning(`ç§»åºé»ååå¤±è´¥ï¼æ¥å£ååºä¸åæ³ï¼${$.response.body}`);
        $.notification.post("ç§»åºèæ¬é»ååå¤±è´¥ï¼æ¥å£è¿åä¸åæ³ã");
      }
    } catch (err) {
      $.logger.error(`ç§»åºé»ååå¤±è´¥ï¼å¼å¸¸ä¿¡æ¯ï¼${err}`);
      $.notification.post("ç§»åºèæ¬é»ååå¤±è´¥ï¼æ§è¡å¼å¸¸ï¼è¯·æ¥éæ¥å¿ã");
    }
  }
}

/**
 * @description: è·åç¨æ·ä¿¡æ¯
 * @param {*}
 * @return {*}
 */
function getUserInfo() {
  let defaultUserInfo = { id: "default", is_vip: false };
  try {
    const userInfo = $.data.read(currentUserInfoKey);
    if (typeof userInfo === "string") userInfo = JSON.parse(userInfo);
    if (!!userInfo && userInfo.hasOwnProperty("id")) {
      return userInfo;
    } else {
      return defaultUserInfo;
    }
  } catch (err) {
    $.logger.error(`è·åç¨æ·ä¿¡æ¯åºç°å¼å¸¸ï¼${err}`);
    return defaultUserInfo;
  }
}

/**
 * @description: ç¥ä¹8.3.0ç§»é¤æ¨èé¡µé¡¶é¨é¡¹
 * @param {*}
 * @return {*}
 */
function removeFeedSections() {
  let response = null;
  try {
    let obj = JSON.parse($.response.body);
    obj.guess_like_sections = [];
    obj.selected_sections = [];
    obj.more_sections = [];
    response = { body: JSON.stringify(obj) };
  } catch (err) {
    $.logger.error(`ç¥ä¹ç§»é¤æ¨èé¡µé¡¶é¨é¡¹åºç°å¼å¸¸ï¼${err}`);
  }
  return response;
}

// prettier-ignore
/**
 *
 * $$\      $$\                     $$\             $$$$$\  $$$$$$\         $$$$$$\
 * $$$\    $$$ |                    \__|            \__$$ |$$  __$$\       $$ ___$$\
 * $$$$\  $$$$ | $$$$$$\   $$$$$$\  $$\  $$$$$$$\      $$ |$$ /  \__|      \_/   $$ |
 * $$\$$\$$ $$ | \____$$\ $$  __$$\ $$ |$$  _____|     $$ |\$$$$$$\          $$$$$ /
 * $$ \$$$  $$ | $$$$$$$ |$$ /  $$ |$$ |$$ /     $$\   $$ | \____$$\         \___$$\
 * $$ |\$  /$$ |$$  __$$ |$$ |  $$ |$$ |$$ |     $$ |  $$ |$$\   $$ |      $$\   $$ |
 * $$ | \_/ $$ |\$$$$$$$ |\$$$$$$$ |$$ |\$$$$$$$\\$$$$$$  |\$$$$$$  |      \$$$$$$  |
 * \__|     \__| \_______| \____$$ |\__| \_______|\______/  \______/        \______/
 *                        $$\   $$ |
 *                        \$$$$$$  |
 *                         \______/
 *
 */
// prettier-ignore
function MagicJS(e="MagicJS",t="INFO"){const i=()=>{const e=typeof $loon!=="undefined";const t=typeof $task!=="undefined";const n=typeof module!=="undefined";const i=typeof $httpClient!=="undefined"&&!e;const s=typeof $storm!=="undefined";const r=typeof $environment!=="undefined"&&typeof $environment["stash-build"]!=="undefined";const o=i||e||s||r;const u=typeof importModule!=="undefined";return{isLoon:e,isQuanX:t,isNode:n,isSurge:i,isStorm:s,isStash:r,isSurgeLike:o,isScriptable:u,get name(){if(e){return"Loon"}else if(t){return"QuantumultX"}else if(n){return"NodeJS"}else if(i){return"Surge"}else if(u){return"Scriptable"}else{return"unknown"}},get build(){if(i){return $environment["surge-build"]}else if(r){return $environment["stash-build"]}else if(s){return $storm.buildVersion}},get language(){if(i||r){return $environment["language"]}},get version(){if(i){return $environment["surge-version"]}else if(r){return $environment["stash-version"]}else if(s){return $storm.appVersion}else if(n){return process.version}},get system(){if(i){return $environment["system"]}else if(n){return process.platform}},get systemVersion(){if(s){return $storm.systemVersion}},get deviceName(){if(s){return $storm.deviceName}}}};const s=(n,e="INFO")=>{let i=e;const s={SNIFFER:6,DEBUG:5,INFO:4,NOTIFY:3,WARNING:2,ERROR:1,CRITICAL:0,NONE:-1};const r={SNIFFER:"",DEBUG:"",INFO:"",NOTIFY:"",WARNING:"â ",ERROR:"â ",CRITICAL:"â ",NONE:""};const t=(e,t="INFO")=>{if(!(s[i]<s[t.toUpperCase()]))console.log(`[${t}] [${n}]\n${r[t.toUpperCase()]}${e}\n`)};const o=e=>{i=e};return{setLevel:o,sniffer:e=>{t(e,"SNIFFER")},debug:e=>{t(e,"DEBUG")},info:e=>{t(e,"INFO")},notify:e=>{t(e,"NOTIFY")},warning:e=>{t(e,"WARNING")},error:e=>{t(e,"ERROR")},retry:e=>{t(e,"RETRY")}}};return new class{constructor(e,t){this._startTime=Date.now();this.version="3.0.0";this.scriptName=e;this.env=i();this.logger=s(e,t);this.http=typeof MagicHttp==="function"?MagicHttp(this.env,this.logger):undefined;this.data=typeof MagicData==="function"?MagicData(this.env,this.logger):undefined;this.notification=typeof MagicNotification==="function"?MagicNotification(this.scriptName,this.env,this.logger):undefined;this.utils=typeof MagicUtils==="function"?MagicUtils(this.env,this.logger):undefined;this.qinglong=typeof MagicQingLong==="function"?MagicQingLong(this.env,this.data,this.logger):undefined;if(typeof this.data!=="undefined"){let e=this.data.read("magic_loglevel");const n=this.data.read("magic_bark_url");if(e){this.logger.setLevel(e.toUpperCase())}if(n){this.notification.setBark(n)}}}get isRequest(){return typeof $request!=="undefined"&&typeof $response==="undefined"}get isResponse(){return typeof $response!=="undefined"}get isDebug(){return this.logger.level==="DEBUG"}get request(){if(typeof $request!=="undefined"){this.logger.sniffer(`RESPONSE:\n${JSON.stringify($request)}`);return $request}}get response(){if(typeof $response!=="undefined"){if($response.hasOwnProperty("status"))$response["statusCode"]=$response["status"];if($response.hasOwnProperty("statusCode"))$response["status"]=$response["statusCode"];this.logger.sniffer(`RESPONSE:\n${JSON.stringify($response)}`);return $response}else{return undefined}}done=(e={})=>{this._endTime=Date.now();let t=(this._endTime-this._startTime)/1e3;this.logger.info(`SCRIPT COMPLETED: ${t} S.`);if(typeof $done!=="undefined"){$done(e)}}}(e,t)}
// prettier-ignore
function MagicNotification(r,f,l){let s=null;let u=null;const c=typeof MagicHttp==="function"?MagicHttp(f,l):undefined;const e=t=>{try{let e=t.replace(/\/+$/g,"");s=`${/^https?:\/\/([^/]*)/.exec(e)[0]}/push`;u=/\/([^\/]+)\/?$/.exec(e)[1]}catch(e){l.error(`Bark url error: ${e}.`)}};function t(e=r,t="",i="",o=""){const n=i=>{try{let t={};if(typeof i==="string"){if(f.isLoon)t={openUrl:i};else if(f.isQuanX)t={"open-url":i};else if(f.isSurge)t={url:i}}else if(typeof i==="object"){if(f.isLoon){t["openUrl"]=!!i["open-url"]?i["open-url"]:"";t["mediaUrl"]=!!i["media-url"]?i["media-url"]:""}else if(f.isQuanX){t=!!i["open-url"]||!!i["media-url"]?i:{}}else if(f.isSurge){let e=i["open-url"]||i["openUrl"];t=e?{url:e}:{}}}return t}catch(e){l.error(`Failed to convert notification option, ${e}`)}return i};o=n(o);if(arguments.length==1){e=r;t="",i=arguments[0]}l.notify(`title:${e}\nsubTitle:${t}\nbody:${i}\noptions:${typeof o==="object"?JSON.stringify(o):o}`);if(f.isSurge){$notification.post(e,t,i,o)}else if(f.isLoon){if(!!o)$notification.post(e,t,i,o);else $notification.post(e,t,i)}else if(f.isQuanX){$notify(e,t,i,o)}if(s&&u&&typeof c!=="undefined"){p(e,t,i)}}function i(e=r,t="",i="",o=""){if(l.level==="DEBUG"){if(arguments.length==1){e=r;t="",i=arguments[0]}this.notify(e,t,i,o)}}function p(e=r,t="",i="",o=""){if(typeof c==="undefined"||typeof c.post==="undefined"){throw"Bark notification needs to import MagicHttp module."}let n={url:s,headers:{"Content-Type":"application/json; charset=utf-8"},body:{title:e,body:t?`${t}\n${i}`:i,device_key:u}};c.post(n).catch(e=>{l.error(`Bark notify error: ${e}`)})}return{post:t,debug:i,bark:p,setBark:e}}
// prettier-ignore
function MagicData(l,f){let u={fs:undefined,data:{}};if(l.isNode){u.fs=require("fs");try{u.fs.accessSync("./magic.json",u.fs.constants.R_OK|u.fs.constants.W_OK)}catch(e){u.fs.writeFileSync("./magic.json","{}",{encoding:"utf8"})}u.data=require("./magic.json")}const o=(e,t)=>{if(typeof t==="object"){return false}else{return e===t}};const a=e=>{if(e==="true"){return true}else if(e==="false"){return false}else if(typeof e==="undefined"){return null}else{return e}};const c=(e,t,r,s)=>{if(r){try{if(typeof e==="string")e=JSON.parse(e);if(e["magic_session"]===true){e=e[r]}else{e=null}}catch{e=null}}if(typeof e==="string"&&e!=="null"){try{e=JSON.parse(e)}catch{}}if(s===false&&!!e&&e["magic_session"]===true){e=null}if((e===null||typeof e==="undefined")&&t!==null&&typeof t!=="undefined"){e=t}e=a(e);return e};const i=t=>{if(typeof t==="string"){let e={};try{e=JSON.parse(t);const r=typeof e;if(r!=="object"||e instanceof Array||r==="bool"||e===null){e={}}}catch{}return e}else if(t instanceof Array||t===null||typeof t==="undefined"||t!==t||typeof t==="boolean"){return{}}else{return t}};const y=(e,t=null,r="",s=false,n=null)=>{let i=n||u.data;if(!!i&&typeof i[e]!=="undefined"&&i[e]!==null){val=i[e]}else{val=!!r?{}:null}val=c(val,t,r,s);return val};const d=(e,t=null,r="",s=false,n=null)=>{let i="";if(n||l.isNode){i=y(e,t,r,s,n)}else{if(l.isSurgeLike){i=$persistentStore.read(e)}else if(l.isQuanX){i=$prefs.valueForKey(e)}i=c(i,t,r,s)}f.debug(`READ DATA [${e}]${!!r?`[${r}]`:""} <${typeof i}>\n${JSON.stringify(i)}`);return i};const p=(t,r,s="",e=null)=>{let n=e||u.data;n=i(n);if(!!s){let e=i(n[t]);e["magic_session"]=true;e[s]=r;n[t]=e}else{n[t]=r}if(e!==null){e=n}return n};const g=(e,t,r="",s=null)=>{if(typeof t==="undefined"||t!==t){return false}if(!l.isNode&&(typeof t==="boolean"||typeof t==="number")){t=String(t)}let n="";if(s||l.isNode){n=p(e,t,r,s)}else{if(!r){n=t}else{if(l.isSurgeLike){n=!!$persistentStore.read(e)?$persistentStore.read(e):n}else if(l.isQuanX){n=!!$prefs.valueForKey(e)?$prefs.valueForKey(e):n}n=i(n);n["magic_session"]=true;n[r]=t}}if(!!n&&typeof n==="object"){n=JSON.stringify(n,"","\t")}f.debug(`WRITE DATA [${e}]${r?`[${r}]`:""} <${typeof t}>\n${JSON.stringify(t)}`);if(!s){if(l.isSurgeLike){return $persistentStore.write(n,e)}else if(l.isQuanX){return $prefs.setValueForKey(n,e)}else if(l.isNode){try{u.fs.writeFileSync("./magic.json",n);return true}catch(e){f.error(e);return false}}}return true};const e=(t,r,s,n=o,i=null)=>{r=a(r);const e=d(t,null,s,false,i);if(n(e,r)===true){return false}else{const l=g(t,r,s,i);let e=d(t,null,s,false,i);if(n===o&&typeof e==="object"){return l}return n(r,e)}};const S=(e,t,r)=>{let s=r||u.data;s=i(s);if(!!t){obj=i(s[e]);delete obj[t];s[e]=obj}else{delete s[e]}if(!!r){r=s}return s};const t=(e,t="",r=null)=>{let s={};if(r||l.isNode){s=S(e,t,r);if(!r){u.fs.writeFileSync("./magic.json",JSON.stringify(s))}else{r=s}}else{if(!t){if(l.isStorm){return $persistentStore.remove(e)}else if(l.isSurgeLike){return $persistentStore.write(null,e)}else if(l.isQuanX){return $prefs.removeValueForKey(e)}}else{if(l.isSurgeLike){s=$persistentStore.read(e)}else if(l.isQuanX){s=$prefs.valueForKey(e)}s=i(s);delete s[t];const n=JSON.stringify(s);g(e,n)}}f.debug(`DELETE KEY [${e}]${!!t?`[${t}]`:""}`)};const r=(e,t=null)=>{let r=[];let s=d(e,null,null,true,t);s=i(s);if(s["magic_session"]!==true){r=[]}else{r=Object.keys(s).filter(e=>e!=="magic_session")}f.debug(`READ ALL SESSIONS [${e}] <${typeof r}>\n${JSON.stringify(r)}`);return r};return{read:d,write:g,del:t,update:e,allSessions:r,defaultValueComparator:o,convertToObject:i}}
