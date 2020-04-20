/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************
 * Copyright (c) 2020 Red Hat, Inc.
 *******************************************************************************/

var fs = require('fs')
const path = require('path')

const config = require('../../config')
// const a11yScan = require('../utils/accessibilityScan')
let page

module.exports = {
  '@disabled': false,

  before: (browser) => {
    const loginPage = browser.page.LoginPage()
    if(process.env.SELENIUM_USER === undefined || process.env.SELENIUM_PASSWORD === undefined){
      browser.end()
      throw new Error('Env variable NOT set.\nPlease export UI user/password as SELENIUM_USER/SELENIUM_PASSWORD')
    }
    loginPage.navigate()
    loginPage.authenticate()

    const url = `${browser.launch_url}${config.get('contextPath')}/all`
    page = browser.page.PolicyController()
    page.navigate(url)
  },

  'Policy controller: single object / musthave + mustnothave': (browser) => {
    const time = browser.globals.time
    const singleMustHaveInform = fs.readFileSync(path.join(__dirname, 'yaml/single_musthave_inform.yaml'))
    var yaml = singleMustHaveInform.toString()
    page.createPolicy(browser, 'policy-pod-single-musthave-inform', yaml, time)
    browser.pause(15000)
    page.checkViolations('policy-pod-single-musthave-inform-' + time, true)
    page.deletePolicy('policy-pod-single-musthave-inform-' + time)
    browser.pause(1000)
    const singleMustHaveEnforce = fs.readFileSync(path.join(__dirname, 'yaml/single_musthave_enforce.yaml'))
    yaml = singleMustHaveEnforce.toString()
    page.createPolicy(browser, 'policy-pod-single-musthave-enforce', yaml, time)
    browser.pause(30000)
    page.checkViolations('policy-pod-single-musthave-enforce-' + time, false)
    page.deletePolicy('policy-pod-single-musthave-enforce-' + time)
    const singleMustNotHaveInform = fs.readFileSync(path.join(__dirname, 'yaml/single_mustnothave_inform.yaml'))
    yaml = singleMustNotHaveInform.toString()
    page.createPolicy(browser, 'policy-pod-single-mustnothave-inform', yaml, time)
    browser.pause(15000)
    page.checkViolations('policy-pod-single-mustnothave-inform-' + time, true)
    page.deletePolicy('policy-pod-single-mustnothave-inform-' + time)
    browser.pause(1000)
    const singleMustNotHaveEnforce = fs.readFileSync(path.join(__dirname, 'yaml/single_mustnothave_enforce.yaml'))
    yaml = singleMustNotHaveEnforce.toString()
    page.createPolicy(browser, 'policy-pod-single-mustnothave-enforce', yaml, time)
    browser.pause(30000)
    page.checkViolations('policy-pod-single-mustnothave-enforce-' + time, false)
    page.deletePolicy('policy-pod-single-mustnothave-enforce-' + time)
  },

  'Policy controller: all objects of kind / exists': (browser) => {
    const time = browser.globals.time
    const kindMustNotHaveNC = fs.readFileSync(path.join(__dirname, 'yaml/kind_mustnothave_noncompliant.yaml'))
    var yaml = kindMustNotHaveNC.toString()
    page.createPolicy(browser, 'policy-ns-mustnothave', yaml, time)
    browser.pause(20000)
    page.checkViolations('policy-ns-mustnothave-' + time, true)
    page.deletePolicy('policy-ns-mustnothave-' + time)
    browser.pause(1000)
    const kindMustHave = fs.readFileSync(path.join(__dirname, 'yaml/kind_musthave_compliant.yaml'))
    yaml = kindMustHave.toString()
    page.createPolicy(browser, 'policy-ns-musthave', yaml, time)
    browser.pause(20000)
    page.checkViolations('policy-ns-musthave-' + time, false)
    page.deletePolicy('policy-ns-musthave-' + time)
  },

  'Policy controller: all objects of kind / does not exist': (browser) => {
    const time = browser.globals.time
    const createNS = fs.readFileSync(path.join(__dirname, 'yaml/create_test_ns.yaml'))
    var yaml = createNS.toString()
    page.createPolicy(browser, 'policy-namespace-create', yaml, time)
    browser.pause(30000)
    page.deletePolicy('policy-namespace-create-' + time)
    browser.pause(1000)
    //do checks
    const kindMustHave = fs.readFileSync(path.join(__dirname, 'yaml/kind_musthave_noncompliant.yaml'))
    yaml = kindMustHave.toString()
    page.createPolicy(browser, 'policy-pod-musthave-all', yaml, time)
    browser.pause(20000)
    page.checkViolations('policy-pod-musthave-all-' + time, true)
    page.deletePolicy('policy-pod-musthave-all-' + time)
    browser.pause(1000)
    const kindMustNotHave = fs.readFileSync(path.join(__dirname, 'yaml/kind_mustnothave_compliant.yaml'))
    yaml = kindMustNotHave.toString()
    page.createPolicy(browser, 'policy-pod-mustnothave-all', yaml, time)
    browser.pause(20000)
    page.checkViolations('policy-pod-mustnothave-all-' + time, false)
    page.deletePolicy('policy-pod-mustnothave-all-' + time)
    //delete ns
    const deleteNS = fs.readFileSync(path.join(__dirname, 'yaml/delete_test_ns.yaml'))
    yaml = deleteNS.toString()
    page.createPolicy(browser, 'policy-namespace-delete', yaml, time)
    browser.pause(15000)
    page.deletePolicy('policy-namespace-delete-' + time)
    browser.pause(1000)
  },

  after: function (browser, done) {
    setTimeout(() => {
      browser.end()
      done()
    })
  }
}