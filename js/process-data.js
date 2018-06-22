const filePath = "static_data/saved_repo_data_06022018.json";

export function getDataForD3() {   
  // let oldStaticData = []
  let gitHubApiData = []
  
  const url = "https://api.github.com/users/gingin77/repos?per_page=100&page=1";

  d3.json(filePath)
    .then(function(oldStaticData) {
      // oldStaticData = oldStaticData;
      keepOrgRepoObjs(oldStaticData);
      evalIfArrysNotNull(gitHubApiData, oldStaticData);
    })
    .catch(err => console.log("Error", err.message));
  
  d3.json(url)
    .then(function(data) {
      data.map(function(item) {
        let langObj = {};

        langObj.repo_name = item.name;
        langObj.primary_repo_lang = item.language;
        langObj.url_for_all_repo_langs = item.languages_url;
        langObj.created_at = item.created_at;
        langObj.pushed_at = item.pushed_at;

        gitHubApiData.push(langObj);
      });
      evalIfArrysNotNull(gitHubApiData, oldStaticData);
    })
    .catch(err => console.log("Error", err.message));
  
  function evalIfArrysNotNull () {
    if (gitHubApiData.length !== 0 && oldStaticData.length !== 0) {
      findNewRepos(gitHubApiData, oldStaticData)
      findDateMatchedRepos(gitHubApiData, oldStaticData)
    }
  }
  
  let newRepoUrlsToFetch = []
  let existingObjsToKeep = []
  let orgObjs = []
  let existingObjsToKeepWiOrgObjs = []
  let updatedRepoUrlsToFetch = []
  
  let keptOrgObjsComplete = false
  let findNewReposComplete = false
  let getURLsForUpdtdReposComplete = false
  
  let combinedArr = []
  
  function findNewRepos (newArray, oldStaticData) {
    let unMatchedObjs = []
    let existingRepos = oldStaticData.map(obj => obj.repo_name)
  
    newArray.forEach(function (obj) {
      if (existingRepos.indexOf(obj.repo_name) === -1) {
        unMatchedObjs.push(obj)
      }
    })
  
    newRepoUrlsToFetch = unMatchedObjs.map((obj) => obj.url_for_all_repo_langs)
    findNewReposComplete = true
    compileURLsToFetch(newRepoUrlsToFetch, updatedRepoUrlsToFetch)
  }
  
  function findDateMatchedRepos (newArray, oldStaticData) {
    let matchedObjs = []
    oldStaticData.forEach(function (existObj) {
      newArray.filter(function (newArObj) {
        if (new Date(existObj.pushed_at).toString() === new Date(newArObj.pushed_at).toString()) {
          matchedObjs.push(existObj)
        }
      })
    })
    existingObjsToKeep = matchedObjs
    combineOrgAndExisToKeep(orgObjs, existingObjsToKeep)
    getURLsForUpdtdRepos(matchedObjs)
  }
  
  function keepOrgRepoObjs (oldStaticData) {
    orgObjs = oldStaticData.filter(obj => obj.url_for_all_repo_langs === 'https://api.github.com/repos/Tourify/tourify_rr/languages')
    combineOrgAndExisToKeep(orgObjs, existingObjsToKeep)
  }
  
  function combineOrgAndExisToKeep (orgObjs, existingObjsToKeep) {
    if (orgObjs.length !== 0 && existingObjsToKeep.length !== 0) {
      existingObjsToKeepWiOrgObjs = existingObjsToKeep.concat(orgObjs)
      keptOrgObjsComplete = true
    }
  }
  
  function getURLsForUpdtdRepos (matchedObjs) {
    let updatedObjsToFetch = []
    oldStaticData.forEach(function (existObj) {
      if (matchedObjs.indexOf(existObj) === -1) {
        updatedObjsToFetch.push(existObj)
      }
    })
    let upDtdUrls = updatedObjsToFetch.map((obj) => obj.url_for_all_repo_langs)
    let upDtdUrlsMinusOrgs = removeOrgUrl(upDtdUrls)
  
    updatedRepoUrlsToFetch = elimateDuplicates(upDtdUrlsMinusOrgs)
    getURLsForUpdtdReposComplete = true
    compileURLsToFetch(newRepoUrlsToFetch, updatedRepoUrlsToFetch)
  }
  
  function removeOrgUrl (upDtdUrls) {
    upDtdUrls = upDtdUrls.filter(obj => obj !== 'https://api.github.com/repos/Tourify/tourify_rr/languages')
    return upDtdUrls
  }
  
  function elimateDuplicates (arr) {
    let obj = {}
    arr.forEach(i => obj[i] = 0)

    return Object.keys(obj);
  }
  
  function compileURLsToFetch (newRepoUrlsToFetch, updatedRepoUrlsToFetch) {
    if (findNewReposComplete === true && getURLsForUpdtdReposComplete === true) {
      combinedArr = newRepoUrlsToFetch.concat(updatedRepoUrlsToFetch)
      splitArryToURLs(combinedArr)
    }
  }
  
  function splitArryToURLs (array) {
    array.forEach(function (item) {
      let url = item
      getLanguageBytes(url)
    })
  }
  
  let langBytesAryofObjs = []
  function getLanguageBytes (url) {
    fetch(url)
      .then(function (response) {
        if (response.status !== 200) {
          console.log(response.status)
          return
        }
        response.json().then(function (data) {
          let repoInfo = {}
          repoInfo.url_for_all_repo_langs = url
          repoInfo.all_lang_bytes_for_repo = data
          langBytesAryofObjs.push(repoInfo)
  
          evalLangBytArrStatus(langBytesAryofObjs)
        })
      })
      .catch(function (err) {
        console.log('Fetch Error :-S', err)
      })
  }
  
  function evalLangBytArrStatus () {
    if (langBytesAryofObjs.length === combinedArr.length) {
      buildComprehensiveObj(gitHubApiData, langBytesAryofObjs)
    }
  }
  
  let comprehensiveObjArr = []
  function buildComprehensiveObj (array1, array2) {
    let comprehensiveObj = {}
    array1.map(function (array1item) {
      let compare = array1item.url_for_all_repo_langs
      array2.map(function (array2item) {
        if (compare === array2item.url_for_all_repo_langs) {
          comprehensiveObj = {
            repo_name: array1item.repo_name,
            url_for_all_repo_langs: array1item.url_for_all_repo_langs,
            primary_repo_lang: array1item.primary_repo_lang,
            created_at: array1item.created_at,
            pushed_at: array1item.pushed_at,
            all_lang_bytes_for_repo: array2item.all_lang_bytes_for_repo
          }
          comprehensiveObjArr.push(comprehensiveObj)
        }
      })
    })
    transformLangObj(comprehensiveObjArr)
  }
  
  function transformLangObj (myData) {
    myData.map(function (obj) {
      let lObj = obj.all_lang_bytes_for_repo
      let nArr = []
      Object.keys(lObj).forEach(key => {
        let nKVP = {
          language: key,
          count: lObj[key]
        }
        nArr.push(nKVP)
      })
      obj.all_lang_bytes_for_repo = nArr
    })
    makeBytesFirst(comprehensiveObjArr)
  }
  
  let newDataObjsArr = []
  
  function makeBytesFirst (myData) {
    myData.map(function (repObj) {
      let bytObj = repObj.all_lang_bytes_for_repo
      let newDataObj = {}
  
      if (bytObj.length !== 0) {
        bytObj.map(function (langByteObj) {
          newDataObj = {
            'language': langByteObj.language,
            'count': langByteObj.count,
            'repo_name': repObj.repo_name,
            'pushed_at': repObj.pushed_at,
            'primary_repo_lang': repObj.primary_repo_lang,
            'url_for_all_repo_langs': repObj.url_for_all_repo_langs
          }
          newDataObjsArr.push(newDataObj)
        })
      } else {
        newDataObj = {
          'language': 'Null',
          'count': 0,
          'repo_name': repObj.repo_name,
          'pushed_at': repObj.pushed_at,
          'primary_repo_lang': 'na',
          'url_for_all_repo_langs': repObj.url_for_all_repo_langs
        }
        newDataObjsArr.push(newDataObj)
      }
    })
  
    combineNewWithExistingObjs(newDataObjsArr, existingObjsToKeepWiOrgObjs)
  }

  let updatedCompObj = []
  
  function combineNewWithExistingObjs (newDataObjsArr, existingObjsToKeepWiOrgObjs) {
    console.log("combineNewWithExistingObjs was called");
    if (keptOrgObjsComplete === true) {
      updatedCompObj = existingObjsToKeepWiOrgObjs.concat(newDataObjsArr)
      return updatedCompObj;
    } else {
      console.log('combineNewWithExistingObjs condition was NOT met')
      return ('combineNewWithExistingObjs condition was NOT met')
    }
  }

  // updatedCompObj = [
  //   {
  //     "language": "JavaScript",
  //     "count": 6886,
  //     "repo_name": "Authentication_proj",
  //     "pushed_at": "2017-08-23T22:55:50Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Authentication_proj/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 810,
  //     "repo_name": "Authentication_proj",
  //     "pushed_at": "2017-08-23T22:55:50Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Authentication_proj/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 13746,
  //     "repo_name": "Bent_Creek_Ceramics",
  //     "pushed_at": "2017-07-28T03:53:06Z",
  //     "primary_repo_lang": "CSS",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Bent_Creek_Ceramics/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 11864,
  //     "repo_name": "Bent_Creek_Ceramics",
  //     "pushed_at": "2017-07-28T03:53:06Z",
  //     "primary_repo_lang": "CSS",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Bent_Creek_Ceramics/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 17820,
  //     "repo_name": "blackjack",
  //     "pushed_at": "2017-09-25T00:15:58Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/blackjack/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 11119,
  //     "repo_name": "book_collection",
  //     "pushed_at": "2017-09-06T19:49:06Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/book_collection/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 7704,
  //     "repo_name": "book_collection",
  //     "pushed_at": "2017-09-06T19:49:06Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/book_collection/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 133,
  //     "repo_name": "book_collection",
  //     "pushed_at": "2017-09-06T19:49:06Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/book_collection/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 17187,
  //     "repo_name": "calculator",
  //     "pushed_at": "2017-09-04T15:05:21Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/calculator/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 2873,
  //     "repo_name": "calculator",
  //     "pushed_at": "2017-09-04T15:05:21Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/calculator/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 1968,
  //     "repo_name": "calculator",
  //     "pushed_at": "2017-09-04T15:05:21Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/calculator/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 11963,
  //     "repo_name": "code_snippet_organizer",
  //     "pushed_at": "2017-09-08T22:11:42Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/code_snippet_organizer/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 10989,
  //     "repo_name": "code_snippet_organizer",
  //     "pushed_at": "2017-09-08T22:11:42Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/code_snippet_organizer/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 830,
  //     "repo_name": "code_snippet_organizer",
  //     "pushed_at": "2017-09-08T22:11:42Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/code_snippet_organizer/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 13454,
  //     "repo_name": "Customer_database",
  //     "pushed_at": "2017-08-14T17:46:58Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Customer_database/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 630,
  //     "repo_name": "Customer_database",
  //     "pushed_at": "2017-08-14T17:46:58Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Customer_database/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 420,
  //     "repo_name": "Customer_database",
  //     "pushed_at": "2017-08-14T17:46:58Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Customer_database/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1283,
  //     "repo_name": "Date_facts",
  //     "pushed_at": "2017-08-14T20:37:01Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Date_facts/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 4122,
  //     "repo_name": "Form_builder",
  //     "pushed_at": "2017-08-01T20:15:17Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Form_builder/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 940,
  //     "repo_name": "Form_builder",
  //     "pushed_at": "2017-08-01T20:15:17Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Form_builder/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 717,
  //     "repo_name": "Form_builder",
  //     "pushed_at": "2017-08-01T20:15:17Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Form_builder/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 28109,
  //     "repo_name": "form_pg",
  //     "pushed_at": "2017-10-09T02:57:22Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/form_pg/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 6147,
  //     "repo_name": "form_pg",
  //     "pushed_at": "2017-10-09T02:57:22Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/form_pg/languages"
  //   },
  //   {
  //     "language": "CoffeeScript",
  //     "count": 211,
  //     "repo_name": "form_pg",
  //     "pushed_at": "2017-10-09T02:57:22Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/form_pg/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 176,
  //     "repo_name": "form_pg",
  //     "pushed_at": "2017-10-09T02:57:22Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/form_pg/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 101,
  //     "repo_name": "form_pg",
  //     "pushed_at": "2017-10-09T02:57:22Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/form_pg/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 36196,
  //     "repo_name": "freeshelf",
  //     "pushed_at": "2017-09-27T18:09:06Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/freeshelf/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 9302,
  //     "repo_name": "freeshelf",
  //     "pushed_at": "2017-09-27T18:09:06Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/freeshelf/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 3286,
  //     "repo_name": "freeshelf",
  //     "pushed_at": "2017-09-27T18:09:06Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/freeshelf/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1156,
  //     "repo_name": "freeshelf",
  //     "pushed_at": "2017-09-27T18:09:06Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/freeshelf/languages"
  //   },
  //   {
  //     "language": "CoffeeScript",
  //     "count": 633,
  //     "repo_name": "freeshelf",
  //     "pushed_at": "2017-09-27T18:09:06Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/freeshelf/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 25708,
  //     "repo_name": "github-profile-languages",
  //     "pushed_at": "2017-09-08T10:52:46Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/github-profile-languages/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 4499,
  //     "repo_name": "github-profile-languages",
  //     "pushed_at": "2017-09-08T10:52:46Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/github-profile-languages/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 3413,
  //     "repo_name": "github-profile-languages",
  //     "pushed_at": "2017-09-08T10:52:46Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/github-profile-languages/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1671,
  //     "repo_name": "GitHub_Data_VCard",
  //     "pushed_at": "2017-08-07T20:13:26Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/GitHub_Data_VCard/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 1372,
  //     "repo_name": "GitHub_Data_VCard",
  //     "pushed_at": "2017-08-07T20:13:26Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/GitHub_Data_VCard/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 887,
  //     "repo_name": "GitHub_Data_VCard",
  //     "pushed_at": "2017-08-07T20:13:26Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/GitHub_Data_VCard/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 3531,
  //     "repo_name": "grades_calculator",
  //     "pushed_at": "2017-09-15T17:45:00Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/grades_calculator/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 2785,
  //     "repo_name": "hamming",
  //     "pushed_at": "2017-09-12T00:30:59Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/hamming/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 7928,
  //     "repo_name": "iTunes_API",
  //     "pushed_at": "2017-11-03T18:07:33Z",
  //     "primary_repo_lang": "CSS",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/iTunes_API/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 5646,
  //     "repo_name": "iTunes_API",
  //     "pushed_at": "2017-11-03T18:07:33Z",
  //     "primary_repo_lang": "CSS",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/iTunes_API/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 1692,
  //     "repo_name": "iTunes_API",
  //     "pushed_at": "2017-11-03T18:07:33Z",
  //     "primary_repo_lang": "CSS",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/iTunes_API/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 3465,
  //     "repo_name": "JS_functions",
  //     "pushed_at": "2017-07-26T19:26:56Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/JS_functions/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 133,
  //     "repo_name": "JS_functions",
  //     "pushed_at": "2017-07-26T19:26:56Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/JS_functions/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 10638,
  //     "repo_name": "memory-game",
  //     "pushed_at": "2017-11-02T17:33:17Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/memory-game/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 7312,
  //     "repo_name": "memory-game",
  //     "pushed_at": "2017-11-02T17:33:17Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/memory-game/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 1622,
  //     "repo_name": "memory-game",
  //     "pushed_at": "2017-11-02T17:33:17Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/memory-game/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 6712,
  //     "repo_name": "My_iBeer",
  //     "pushed_at": "2017-07-22T13:36:10Z",
  //     "primary_repo_lang": "CSS",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/My_iBeer/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 5770,
  //     "repo_name": "My_iBeer",
  //     "pushed_at": "2017-07-22T13:36:10Z",
  //     "primary_repo_lang": "CSS",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/My_iBeer/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 25230,
  //     "repo_name": "paperclip_test",
  //     "pushed_at": "2017-10-17T18:31:40Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/paperclip_test/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 6783,
  //     "repo_name": "paperclip_test",
  //     "pushed_at": "2017-10-17T18:31:40Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/paperclip_test/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1156,
  //     "repo_name": "paperclip_test",
  //     "pushed_at": "2017-10-17T18:31:40Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/paperclip_test/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 939,
  //     "repo_name": "paperclip_test",
  //     "pushed_at": "2017-10-17T18:31:40Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/paperclip_test/languages"
  //   },
  //   {
  //     "language": "CoffeeScript",
  //     "count": 211,
  //     "repo_name": "paperclip_test",
  //     "pushed_at": "2017-10-17T18:31:40Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/paperclip_test/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 4530,
  //     "repo_name": "pig",
  //     "pushed_at": "2017-09-15T19:13:34Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/pig/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 4661,
  //     "repo_name": "Puppy_CSS_repo",
  //     "pushed_at": "2017-07-20T02:00:55Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Puppy_CSS_repo/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 1246,
  //     "repo_name": "Puppy_CSS_repo",
  //     "pushed_at": "2017-07-20T02:00:55Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Puppy_CSS_repo/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 6459,
  //     "repo_name": "puppy_recipe_API",
  //     "pushed_at": "2017-08-09T23:55:29Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/puppy_recipe_API/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 1242,
  //     "repo_name": "puppy_recipe_API",
  //     "pushed_at": "2017-08-09T23:55:29Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/puppy_recipe_API/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 111,
  //     "repo_name": "puppy_recipe_API",
  //     "pushed_at": "2017-08-09T23:55:29Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/puppy_recipe_API/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 36175,
  //     "repo_name": "question_box_group",
  //     "pushed_at": "2017-09-30T19:07:45Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/question_box_group/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 626,
  //     "repo_name": "question_box_group",
  //     "pushed_at": "2017-09-30T19:07:45Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/question_box_group/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 36029,
  //     "repo_name": "Quiz_show",
  //     "pushed_at": "2017-10-04T19:36:58Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Quiz_show/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 10221,
  //     "repo_name": "Quiz_show",
  //     "pushed_at": "2017-10-04T19:36:58Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Quiz_show/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 1600,
  //     "repo_name": "Quiz_show",
  //     "pushed_at": "2017-10-04T19:36:58Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Quiz_show/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1156,
  //     "repo_name": "Quiz_show",
  //     "pushed_at": "2017-10-04T19:36:58Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Quiz_show/languages"
  //   },
  //   {
  //     "language": "CoffeeScript",
  //     "count": 1055,
  //     "repo_name": "Quiz_show",
  //     "pushed_at": "2017-10-04T19:36:58Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Quiz_show/languages"
  //   },
  //   {
  //     "language": "Shell",
  //     "count": 131,
  //     "repo_name": "Quiz_show",
  //     "pushed_at": "2017-10-04T19:36:58Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Quiz_show/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 31068,
  //     "repo_name": "rails_bridge",
  //     "pushed_at": "2017-08-26T18:17:37Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/rails_bridge/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 7474,
  //     "repo_name": "rails_bridge",
  //     "pushed_at": "2017-08-26T18:17:37Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/rails_bridge/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 1991,
  //     "repo_name": "rails_bridge",
  //     "pushed_at": "2017-08-26T18:17:37Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/rails_bridge/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1156,
  //     "repo_name": "rails_bridge",
  //     "pushed_at": "2017-08-26T18:17:37Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/rails_bridge/languages"
  //   },
  //   {
  //     "language": "CoffeeScript",
  //     "count": 211,
  //     "repo_name": "rails_bridge",
  //     "pushed_at": "2017-08-26T18:17:37Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/rails_bridge/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 29713,
  //     "repo_name": "rails_getting_started_blog",
  //     "pushed_at": "2017-09-26T22:56:22Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/rails_getting_started_blog/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 7929,
  //     "repo_name": "rails_getting_started_blog",
  //     "pushed_at": "2017-09-26T22:56:22Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/rails_getting_started_blog/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 1245,
  //     "repo_name": "rails_getting_started_blog",
  //     "pushed_at": "2017-09-26T22:56:22Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/rails_getting_started_blog/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1156,
  //     "repo_name": "rails_getting_started_blog",
  //     "pushed_at": "2017-09-26T22:56:22Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/rails_getting_started_blog/languages"
  //   },
  //   {
  //     "language": "CoffeeScript",
  //     "count": 633,
  //     "repo_name": "rails_getting_started_blog",
  //     "pushed_at": "2017-09-26T22:56:22Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/rails_getting_started_blog/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 4936,
  //     "repo_name": "Responsive_layout_assignment",
  //     "pushed_at": "2017-07-25T03:16:33Z",
  //     "primary_repo_lang": "CSS",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Responsive_layout_assignment/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 2363,
  //     "repo_name": "Responsive_layout_assignment",
  //     "pushed_at": "2017-07-25T03:16:33Z",
  //     "primary_repo_lang": "CSS",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Responsive_layout_assignment/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 2765,
  //     "repo_name": "robot_database",
  //     "pushed_at": "2017-08-16T21:55:08Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/robot_database/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 927,
  //     "repo_name": "robot_database",
  //     "pushed_at": "2017-08-16T21:55:08Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/robot_database/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 703,
  //     "repo_name": "robot_database",
  //     "pushed_at": "2017-08-16T21:55:08Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/robot_database/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 7159,
  //     "repo_name": "Robot_reboot_with_mongo",
  //     "pushed_at": "2017-08-29T23:57:56Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Robot_reboot_with_mongo/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 3792,
  //     "repo_name": "Robot_reboot_with_mongo",
  //     "pushed_at": "2017-08-29T23:57:56Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Robot_reboot_with_mongo/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 1384,
  //     "repo_name": "Robot_reboot_with_mongo",
  //     "pushed_at": "2017-08-29T23:57:56Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Robot_reboot_with_mongo/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 7826,
  //     "repo_name": "Stars_for_Tuesday",
  //     "pushed_at": "2017-07-18T19:47:15Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Stars_for_Tuesday/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 3757,
  //     "repo_name": "Starting_JS",
  //     "pushed_at": "2017-07-25T19:33:01Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Starting_JS/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 182,
  //     "repo_name": "Starting_JS",
  //     "pushed_at": "2017-07-25T19:33:01Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Starting_JS/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 7479,
  //     "repo_name": "stat_tracker_api",
  //     "pushed_at": "2017-09-24T04:34:46Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/stat_tracker_api/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 6020,
  //     "repo_name": "Thurs_pm_loops_etc",
  //     "pushed_at": "2017-07-27T19:20:13Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Thurs_pm_loops_etc/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 437,
  //     "repo_name": "Thurs_pm_loops_etc",
  //     "pushed_at": "2017-07-27T19:20:13Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Thurs_pm_loops_etc/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 422,
  //     "repo_name": "Thurs_pm_loops_etc",
  //     "pushed_at": "2017-07-27T19:20:13Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Thurs_pm_loops_etc/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 1629,
  //     "repo_name": "todolist2",
  //     "pushed_at": "2017-08-17T23:42:05Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/todolist2/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1227,
  //     "repo_name": "todolist2",
  //     "pushed_at": "2017-08-17T23:42:05Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/todolist2/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 32,
  //     "repo_name": "todolist2",
  //     "pushed_at": "2017-08-17T23:42:05Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/todolist2/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 25825,
  //     "repo_name": "tourify_backend",
  //     "pushed_at": "2017-10-06T04:02:46Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/tourify_backend/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 1502,
  //     "repo_name": "tourify_backend",
  //     "pushed_at": "2017-10-06T04:02:46Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/tourify_backend/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 4327,
  //     "repo_name": "to_do_list",
  //     "pushed_at": "2017-08-16T02:41:42Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/to_do_list/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1831,
  //     "repo_name": "to_do_list",
  //     "pushed_at": "2017-08-16T02:41:42Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/to_do_list/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 28060,
  //     "repo_name": "widget2",
  //     "pushed_at": "2017-11-10T05:20:42Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/widget2/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 6109,
  //     "repo_name": "widget2",
  //     "pushed_at": "2017-11-10T05:20:42Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/widget2/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1983,
  //     "repo_name": "widget2",
  //     "pushed_at": "2017-11-10T05:20:42Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/widget2/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 889,
  //     "repo_name": "widget2",
  //     "pushed_at": "2017-11-10T05:20:42Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/widget2/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 3184,
  //     "repo_name": "word_frequency",
  //     "pushed_at": "2017-09-14T23:32:23Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/word_frequency/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 6278,
  //     "repo_name": "Word_game",
  //     "pushed_at": "2017-11-04T15:18:06Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Word_game/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 2722,
  //     "repo_name": "Word_game",
  //     "pushed_at": "2017-11-04T15:18:06Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Word_game/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 1175,
  //     "repo_name": "Word_game",
  //     "pushed_at": "2017-11-04T15:18:06Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Word_game/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 5346,
  //     "repo_name": "gh_language_graph",
  //     "pushed_at": "2017-12-01T19:35:23Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gh_language_graph/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 3734,
  //     "repo_name": "gh_language_graph",
  //     "pushed_at": "2017-12-01T19:35:23Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gh_language_graph/languages"
  //   },
  //   {
  //     "language": "Null",
  //     "count": 0,
  //     "repo_name": "hello-world",
  //     "pushed_at": "2017-07-10T01:26:21Z",
  //     "primary_repo_lang": "na",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/hello-world/languages"
  //   },
  //   {
  //     "language": "Null",
  //     "count": 0,
  //     "repo_name": "My_first_SQL_project",
  //     "pushed_at": "2017-09-05T18:16:58Z",
  //     "primary_repo_lang": "na",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/My_first_SQL_project/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 7429,
  //     "repo_name": "New_to_test_fetch_sort",
  //     "pushed_at": "2017-11-28T18:41:01Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/New_to_test_fetch_sort/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 876,
  //     "repo_name": "New_to_test_fetch_sort",
  //     "pushed_at": "2017-11-28T18:41:01Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/New_to_test_fetch_sort/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 71882,
  //     "repo_name": "devcamp-portfolio",
  //     "pushed_at": "2017-12-21T03:38:36Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/devcamp-portfolio/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 47906,
  //     "repo_name": "devcamp-portfolio",
  //     "pushed_at": "2017-12-21T03:38:36Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/devcamp-portfolio/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 36837,
  //     "repo_name": "devcamp-portfolio",
  //     "pushed_at": "2017-12-21T03:38:36Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/devcamp-portfolio/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 8783,
  //     "repo_name": "devcamp-portfolio",
  //     "pushed_at": "2017-12-21T03:38:36Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/devcamp-portfolio/languages"
  //   },
  //   {
  //     "language": "CoffeeScript",
  //     "count": 2446,
  //     "repo_name": "devcamp-portfolio",
  //     "pushed_at": "2017-12-21T03:38:36Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/devcamp-portfolio/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 43540,
  //     "repo_name": "Devise_test_2",
  //     "pushed_at": "2017-12-19T03:57:11Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Devise_test_2/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 13625,
  //     "repo_name": "Devise_test_2",
  //     "pushed_at": "2017-12-19T03:57:11Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Devise_test_2/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1156,
  //     "repo_name": "Devise_test_2",
  //     "pushed_at": "2017-12-19T03:57:11Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Devise_test_2/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 1060,
  //     "repo_name": "Devise_test_2",
  //     "pushed_at": "2017-12-19T03:57:11Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Devise_test_2/languages"
  //   },
  //   {
  //     "language": "CoffeeScript",
  //     "count": 422,
  //     "repo_name": "Devise_test_2",
  //     "pushed_at": "2017-12-19T03:57:11Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Devise_test_2/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 27841,
  //     "repo_name": "exercism_ruby",
  //     "pushed_at": "2018-01-28T15:53:06Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/exercism_ruby/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 116152,
  //     "repo_name": "gdi-intro-js",
  //     "pushed_at": "2018-04-16T23:01:23Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gdi-intro-js/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 79477,
  //     "repo_name": "gdi-intro-js",
  //     "pushed_at": "2018-04-16T23:01:23Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gdi-intro-js/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 54239,
  //     "repo_name": "gdi-intro-js",
  //     "pushed_at": "2018-04-16T23:01:23Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gdi-intro-js/languages"
  //   },
  //   {
  //     "language": "GLSL",
  //     "count": 1654,
  //     "repo_name": "gdi-intro-js",
  //     "pushed_at": "2018-04-16T23:01:23Z",
  //     "primary_repo_lang": "HTML",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gdi-intro-js/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 3140,
  //     "repo_name": "gdi_js_samples",
  //     "pushed_at": "2018-04-11T23:05:14Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gdi_js_samples/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 1748,
  //     "repo_name": "gdi_js_samples",
  //     "pushed_at": "2018-04-11T23:05:14Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gdi_js_samples/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 73423,
  //     "repo_name": "gh_rest_api_fetch",
  //     "pushed_at": "2017-12-08T19:26:54Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gh_rest_api_fetch/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 1127,
  //     "repo_name": "gh_rest_api_fetch",
  //     "pushed_at": "2017-12-08T19:26:54Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gh_rest_api_fetch/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 1121,
  //     "repo_name": "gh_rest_api_fetch",
  //     "pushed_at": "2017-12-08T19:26:54Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gh_rest_api_fetch/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 57434,
  //     "repo_name": "gradebook",
  //     "pushed_at": "2018-04-23T03:51:28Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gradebook/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 14257,
  //     "repo_name": "gradebook",
  //     "pushed_at": "2018-04-23T03:51:28Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gradebook/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 1790,
  //     "repo_name": "gradebook",
  //     "pushed_at": "2018-04-23T03:51:28Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gradebook/languages"
  //   },
  //   {
  //     "language": "CoffeeScript",
  //     "count": 1266,
  //     "repo_name": "gradebook",
  //     "pushed_at": "2018-04-23T03:51:28Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gradebook/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1156,
  //     "repo_name": "gradebook",
  //     "pushed_at": "2018-04-23T03:51:28Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gradebook/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 48186,
  //     "repo_name": "Rails-Devise-Skeleton",
  //     "pushed_at": "2017-12-18T00:57:28Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Rails-Devise-Skeleton/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 14178,
  //     "repo_name": "Rails-Devise-Skeleton",
  //     "pushed_at": "2017-12-18T00:57:28Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Rails-Devise-Skeleton/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 2071,
  //     "repo_name": "Rails-Devise-Skeleton",
  //     "pushed_at": "2017-12-18T00:57:28Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Rails-Devise-Skeleton/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 661,
  //     "repo_name": "Rails-Devise-Skeleton",
  //     "pushed_at": "2017-12-18T00:57:28Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Rails-Devise-Skeleton/languages"
  //   },
  //   {
  //     "language": "CoffeeScript",
  //     "count": 422,
  //     "repo_name": "Rails-Devise-Skeleton",
  //     "pushed_at": "2017-12-18T00:57:28Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/Rails-Devise-Skeleton/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 2547,
  //     "repo_name": "scroll_to_fixed_nav_bar",
  //     "pushed_at": "2018-01-11T16:21:55Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/scroll_to_fixed_nav_bar/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 1431,
  //     "repo_name": "scroll_to_fixed_nav_bar",
  //     "pushed_at": "2018-01-11T16:21:55Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/scroll_to_fixed_nav_bar/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 798,
  //     "repo_name": "scroll_to_fixed_nav_bar",
  //     "pushed_at": "2018-01-11T16:21:55Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/scroll_to_fixed_nav_bar/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 47532,
  //     "repo_name": "UserTypesApp",
  //     "pushed_at": "2017-12-18T03:46:27Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/UserTypesApp/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 13735,
  //     "repo_name": "UserTypesApp",
  //     "pushed_at": "2017-12-18T03:46:27Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/UserTypesApp/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1156,
  //     "repo_name": "UserTypesApp",
  //     "pushed_at": "2017-12-18T03:46:27Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/UserTypesApp/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 885,
  //     "repo_name": "UserTypesApp",
  //     "pushed_at": "2017-12-18T03:46:27Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/UserTypesApp/languages"
  //   },
  //   {
  //     "language": "CoffeeScript",
  //     "count": 211,
  //     "repo_name": "UserTypesApp",
  //     "pushed_at": "2017-12-18T03:46:27Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/UserTypesApp/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 65014,
  //     "repo_name": "tourify_rr",
  //     "pushed_at": "2017-11-28T18:10:20Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/Tourify/tourify_rr/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 28688,
  //     "repo_name": "tourify_rr",
  //     "pushed_at": "2017-11-28T18:10:20Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/Tourify/tourify_rr/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 14994,
  //     "repo_name": "tourify_rr",
  //     "pushed_at": "2017-11-28T18:10:20Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/Tourify/tourify_rr/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 8121,
  //     "repo_name": "tourify_rr",
  //     "pushed_at": "2017-11-28T18:10:20Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/Tourify/tourify_rr/languages"
  //   },
  //   {
  //     "language": "CoffeeScript",
  //     "count": 1477,
  //     "repo_name": "tourify_rr",
  //     "pushed_at": "2017-11-28T18:10:20Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/Tourify/tourify_rr/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 19186,
  //     "repo_name": "currency_converter",
  //     "pushed_at": "2018-06-16T23:51:03Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/currency_converter/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 26176,
  //     "repo_name": "dragon_app",
  //     "pushed_at": "2018-06-04T20:24:17Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/dragon_app/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 6513,
  //     "repo_name": "dragon_app",
  //     "pushed_at": "2018-06-04T20:24:17Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/dragon_app/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 6507,
  //     "repo_name": "dragon_app",
  //     "pushed_at": "2018-06-04T20:24:17Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/dragon_app/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 1798,
  //     "repo_name": "dragon_app",
  //     "pushed_at": "2018-06-04T20:24:17Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/dragon_app/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 51317,
  //     "repo_name": "gingin77.github.io",
  //     "pushed_at": "2018-06-21T04:41:44Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gingin77.github.io/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 28144,
  //     "repo_name": "gingin77.github.io",
  //     "pushed_at": "2018-06-21T04:41:44Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gingin77.github.io/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 11189,
  //     "repo_name": "gingin77.github.io",
  //     "pushed_at": "2018-06-21T04:41:44Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/gingin77.github.io/languages"
  //   },
  //   {
  //     "language": "Ruby",
  //     "count": 128167,
  //     "repo_name": "hackernews_clone",
  //     "pushed_at": "2018-06-17T12:35:20Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/hackernews_clone/languages"
  //   },
  //   {
  //     "language": "HTML",
  //     "count": 20342,
  //     "repo_name": "hackernews_clone",
  //     "pushed_at": "2018-06-17T12:35:20Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/hackernews_clone/languages"
  //   },
  //   {
  //     "language": "CSS",
  //     "count": 4096,
  //     "repo_name": "hackernews_clone",
  //     "pushed_at": "2018-06-17T12:35:20Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/hackernews_clone/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1177,
  //     "repo_name": "hackernews_clone",
  //     "pushed_at": "2018-06-17T12:35:20Z",
  //     "primary_repo_lang": "Ruby",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/hackernews_clone/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 374068,
  //     "repo_name": "lodash",
  //     "pushed_at": "2018-06-12T12:01:36Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/lodash/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 338,
  //     "repo_name": "node-js-sample",
  //     "pushed_at": "2018-05-24T09:12:57Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/node-js-sample/languages"
  //   },
  //   {
  //     "language": "Shell",
  //     "count": 303453,
  //     "repo_name": "nvm",
  //     "pushed_at": "2018-06-10T21:18:24Z",
  //     "primary_repo_lang": "Shell",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/nvm/languages"
  //   },
  //   {
  //     "language": "Makefile",
  //     "count": 5364,
  //     "repo_name": "nvm",
  //     "pushed_at": "2018-06-10T21:18:24Z",
  //     "primary_repo_lang": "Shell",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/nvm/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 38,
  //     "repo_name": "nvm",
  //     "pushed_at": "2018-06-10T21:18:24Z",
  //     "primary_repo_lang": "Shell",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/nvm/languages"
  //   },
  //   {
  //     "language": "JavaScript",
  //     "count": 1909,
  //     "repo_name": "vidly",
  //     "pushed_at": "2018-06-08T15:07:34Z",
  //     "primary_repo_lang": "JavaScript",
  //     "url_for_all_repo_langs": "https://api.github.com/repos/gingin77/vidly/languages"
  //   }
  // ]

  // return updatedCompObj;
}