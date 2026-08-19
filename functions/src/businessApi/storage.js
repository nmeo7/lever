const { db } = require('../util/data')

const getBusinessConfig = async (businessId) => {
  const accountDoc = await db.collection('erp-accounts').doc(businessId).get()
  return accountDoc.data()?.config ?? {}
}

module.exports = { getBusinessConfig }
