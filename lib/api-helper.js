const PointDNS = require('pointdns')
const config = require('./config')
const Promise = require('bluebird')

const credentials = (config.get('credentials') || [])
      .find((c) => c.isDefault)

const dns = PointDNS(credentials)

module.exports = {
  getZones: () => new Promise((resolve, reject) => {
    return dns.zones.list({}, (err, zones) => {
      if (err) return reject(new Error(err))
      return resolve(zones)
    })
  }),
  getRecords: (zoneId) => new Promise((resolve, reject) => {
    const args = { zone_id: zoneId }
    return dns.records.list(args, (err, records) => {
      if (err) return reject(new Error(err))
      return resolve(records)
    })
  }),
  deleteRecords: (zoneId, recordIds = []) => {
    const args = { zone_id: zoneId }

    if (isNaN(zoneId)) {
      return Promise.reject(new Error('Invalid zone.'))
    }

    if (!Array.isArray(recordIds) || !recordIds.length) {
      return Promise.reject(new Error('Invalid or missing records.'))
    }

    return Promise.map(recordIds, (id) => new Promise((resolve, reject) => {
      return dns.record.del({ ...args, record_id: id }, (err, record) => {
        if (err) return reject(new Error(err))
        return resolve(record)
      })
    }), { concurrency: 1 })
  },
  deleteZones: (zoneIds) => {
    if (!Array.isArray(zoneIds) || !zoneIds.length) {
      return Promise.reject(new Error('Invalid or missing records.'))
    }

    return Promise.map(zoneIds, (id) => new Promise((resolve, reject) => {
      return dns.zone.del({ zone_id: id }, (err, record) => {
        if (err) return reject(new Error(err))
        return resolve(record)
      })
    }), { concurrency: 1 })
  }
}
