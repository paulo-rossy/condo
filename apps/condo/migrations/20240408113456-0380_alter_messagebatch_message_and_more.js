// auto generated by kmigrator
// KMIGRATOR:0380_alter_messagebatch_message_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMi4zIG9uIDIwMjQtMDQtMDggMDY6MzUKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAzNzlfdXNlcmhlbHByZXF1ZXN0X3VzZXJoZWxwcmVxdWVzdGZpbGVfdXNlcmhlbHByZXF1ZXN0ZmlsZWhpc3RvcnlyZWNvcmRfdXNlcmhlbHByZXF1ZXN0aGlzdG9yeXJlY29yZCcpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5BbHRlckZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdtZXNzYWdlYmF0Y2gnLAogICAgICAgICAgICBuYW1lPSdtZXNzYWdlJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BbHRlckZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdtZXNzYWdlYmF0Y2gnLAogICAgICAgICAgICBuYW1lPSdtZXNzYWdlVHlwZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5DaGFyRmllbGQoY2hvaWNlcz1bKCdDVVNUT01fQ09OVEVOVF9NRVNTQUdFJywgJ0NVU1RPTV9DT05URU5UX01FU1NBR0UnKSwgKCdNT0JJTEVfQVBQX1VQREFURV9BVkFJTEFCTEVfTUVTU0FHRV9QVVNIJywgJ01PQklMRV9BUFBfVVBEQVRFX0FWQUlMQUJMRV9NRVNTQUdFX1BVU0gnKV0sIG1heF9sZW5ndGg9NTApLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BbHRlckZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdtZXNzYWdlYmF0Y2gnLAogICAgICAgICAgICBuYW1lPSd0aXRsZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWx0ZXJGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nbm90aWZpY2F0aW9uYW5vbnltb3Vzc2V0dGluZycsCiAgICAgICAgICAgIG5hbWU9J21lc3NhZ2VUeXBlJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkNoYXJGaWVsZChibGFuaz1UcnVlLCBjaG9pY2VzPVsoJ1RJQ0tFVF9DUkVBVEVEJywgJ1RJQ0tFVF9DUkVBVEVEJyksICgnVElDS0VUX0NPTU1FTlRfQ1JFQVRFRCcsICdUSUNLRVRfQ09NTUVOVF9DUkVBVEVEJyksICgnSU5WSVRFX05FV19FTVBMT1lFRScsICdJTlZJVEVfTkVXX0VNUExPWUVFJyksICgnU0hBUkVfVElDS0VUJywgJ1NIQVJFX1RJQ0tFVCcpLCAoJ0JBTktfQUNDT1VOVF9DUkVBVElPTl9SRVFVRVNUJywgJ0JBTktfQUNDT1VOVF9DUkVBVElPTl9SRVFVRVNUJyksICgnRElSVFlfSU5WSVRFX05FV19FTVBMT1lFRV9TTVMnLCAnRElSVFlfSU5WSVRFX05FV19FTVBMT1lFRV9TTVMnKSwgKCdESVJUWV9JTlZJVEVfTkVXX0VNUExPWUVFX0VNQUlMJywgJ0RJUlRZX0lOVklURV9ORVdfRU1QTE9ZRUVfRU1BSUwnKSwgKCdSRUdJU1RFUl9ORVdfVVNFUicsICdSRUdJU1RFUl9ORVdfVVNFUicpLCAoJ1JFU0VUX1BBU1NXT1JEJywgJ1JFU0VUX1BBU1NXT1JEJyksICgnU01TX1ZFUklGWScsICdTTVNfVkVSSUZZJyksICgnREVWRUxPUEVSX0lNUE9SVEFOVF9OT1RFX1RZUEUnLCAnREVWRUxPUEVSX0lNUE9SVEFOVF9OT1RFX1RZUEUnKSwgKCdDVVNUT01FUl9JTVBPUlRBTlRfTk9URV9UWVBFJywgJ0NVU1RPTUVSX0lNUE9SVEFOVF9OT1RFX1RZUEUnKSwgKCdNRVNTQUdFX0ZPUldBUkRFRF9UT19TVVBQT1JUJywgJ01FU1NBR0VfRk9SV0FSREVEX1RPX1NVUFBPUlQnKSwgKCdUSUNLRVRfQVNTSUdORUVfQ09OTkVDVEVEJywgJ1RJQ0tFVF9BU1NJR05FRV9DT05ORUNURUQnKSwgKCdUSUNLRVRfRVhFQ1VUT1JfQ09OTkVDVEVEJywgJ1RJQ0tFVF9FWEVDVVRPUl9DT05ORUNURUQnKSwgKCdUUkFDS19USUNLRVRfSU5fRE9NQV9BUFAnLCAnVFJBQ0tfVElDS0VUX0lOX0RPTUFfQVBQJyksICgnVElDS0VUX1NUQVRVU19PUEVORUQnLCAnVElDS0VUX1NUQVRVU19PUEVORUQnKSwgKCdUSUNLRVRfU1RBVFVTX0lOX1BST0dSRVNTJywgJ1RJQ0tFVF9TVEFUVVNfSU5fUFJPR1JFU1MnKSwgKCdUSUNLRVRfU1RBVFVTX0NPTVBMRVRFRCcsICdUSUNLRVRfU1RBVFVTX0NPTVBMRVRFRCcpLCAoJ1RJQ0tFVF9TVEFUVVNfUkVUVVJORUQnLCAnVElDS0VUX1NUQVRVU19SRVRVUk5FRCcpLCAoJ1RJQ0tFVF9TVEFUVVNfREVDTElORUQnLCAnVElDS0VUX1NUQVRVU19ERUNMSU5FRCcpLCAoJ1RJQ0tFVF9DT01NRU5UX0FEREVEJywgJ1RJQ0tFVF9DT01NRU5UX0FEREVEJyksICgnTUVURVJfVkVSSUZJQ0FUSU9OX0RBVEVfUkVNSU5ERVInLCAnTUVURVJfVkVSSUZJQ0FUSU9OX0RBVEVfUkVNSU5ERVInKSwgKCdSRVNJREVOVF9BRERfQklMTElOR19BQ0NPVU5UJywgJ1JFU0lERU5UX0FERF9CSUxMSU5HX0FDQ09VTlQnKSwgKCdCSUxMSU5HX1JFQ0VJUFRfQVZBSUxBQkxFJywgJ0JJTExJTkdfUkVDRUlQVF9BVkFJTEFCTEUnKSwgKCdCSUxMSU5HX1JFQ0VJUFRfQVZBSUxBQkxFX05PX0FDQ09VTlQnLCAnQklMTElOR19SRUNFSVBUX0FWQUlMQUJMRV9OT19BQ0NPVU5UJyksICgnQklMTElOR19SRUNFSVBUX0NBVEVHT1JZX0FWQUlMQUJMRScsICdCSUxMSU5HX1JFQ0VJUFRfQ0FURUdPUllfQVZBSUxBQkxFJyksICgnQklMTElOR19SRUNFSVBUX0FEREVEJywgJ0JJTExJTkdfUkVDRUlQVF9BRERFRCcpLCAoJ0JJTExJTkdfUkVDRUlQVF9GSUxFX0FEREVEJywgJ0JJTExJTkdfUkVDRUlQVF9GSUxFX0FEREVEJyksICgnQklMTElOR19SRUNFSVBUX0FEREVEX1dJVEhfREVCVCcsICdCSUxMSU5HX1JFQ0VJUFRfQURERURfV0lUSF9ERUJUJyksICgnQklMTElOR19SRUNFSVBUX0FEREVEX1dJVEhfTk9fREVCVCcsICdCSUxMSU5HX1JFQ0VJUFRfQURERURfV0lUSF9OT19ERUJUJyksICgnTUVURVJfU1VCTUlUX1JFQURJTkdTX1JFTUlOREVSJywgJ01FVEVSX1NVQk1JVF9SRUFESU5HU19SRU1JTkRFUicpLCAoJ01FVEVSX1NVQk1JVF9SRUFESU5HU19SRU1JTkRFUl9TVEFSVF9QRVJJT0QnLCAnTUVURVJfU1VCTUlUX1JFQURJTkdTX1JFTUlOREVSX1NUQVJUX1BFUklPRCcpLCAoJ01FVEVSX1NVQk1JVF9SRUFESU5HU19SRU1JTkRFUl9FTkRfUEVSSU9EJywgJ01FVEVSX1NVQk1JVF9SRUFESU5HU19SRU1JTkRFUl9FTkRfUEVSSU9EJyksICgnTUVURVJfVkVSSUZJQ0FUSU9OX0RBVEVfRVhQSVJFRCcsICdNRVRFUl9WRVJJRklDQVRJT05fREFURV9FWFBJUkVEJyksICgnUkVTSURFTlRfVVBHUkFERV9BUFAnLCAnUkVTSURFTlRfVVBHUkFERV9BUFAnKSwgKCdTVEFGRl9VUEdSQURFX0FQUCcsICdTVEFGRl9VUEdSQURFX0FQUCcpLCAoJ0NVU1RPTV9DT05URU5UX01FU1NBR0VfUFVTSCcsICdDVVNUT01fQ09OVEVOVF9NRVNTQUdFX1BVU0gnKSwgKCdNT0JJTEVfQVBQX1VQREFURV9BVkFJTEFCTEVfTUVTU0FHRV9QVVNIJywgJ01PQklMRV9BUFBfVVBEQVRFX0FWQUlMQUJMRV9NRVNTQUdFX1BVU0gnKSwgKCdDVVNUT01fQ09OVEVOVF9NRVNTQUdFX0VNQUlMJywgJ0NVU1RPTV9DT05URU5UX01FU1NBR0VfRU1BSUwnKSwgKCdDVVNUT01fQ09OVEVOVF9NRVNTQUdFX1NNUycsICdDVVNUT01fQ09OVEVOVF9NRVNTQUdFX1NNUycpLCAoJ1ZPSVBfSU5DT01JTkdfQ0FMTF9NRVNTQUdFJywgJ1ZPSVBfSU5DT01JTkdfQ0FMTF9NRVNTQUdFJyksICgnQjJDX0FQUF9NRVNTQUdFX1BVU0gnLCAnQjJDX0FQUF9NRVNTQUdFX1BVU0gnKSwgKCdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX1NVQ0NFU1NfUkVTVUxUX01FU1NBR0UnLCAnUkVDVVJSRU5UX1BBWU1FTlRfUFJPQ0VFRElOR19TVUNDRVNTX1JFU1VMVF9NRVNTQUdFJyksICgnUkVDVVJSRU5UX1BBWU1FTlRfUFJPQ0VFRElOR19VTktOT1dOX0VSUk9SX01FU1NBR0UnLCAnUkVDVVJSRU5UX1BBWU1FTlRfUFJPQ0VFRElOR19VTktOT1dOX0VSUk9SX01FU1NBR0UnKSwgKCdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX0FDUVVJUklOR19QQVlNRU5UX1BST0NFRURfRVJST1JfTUVTU0FHRScsICdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX0FDUVVJUklOR19QQVlNRU5UX1BST0NFRURfRVJST1JfTUVTU0FHRScpLCAoJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfU0VSVklDRV9DT05TVU1FUl9OT1RfRk9VTkRfRVJST1JfTUVTU0FHRScsICdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX1NFUlZJQ0VfQ09OU1VNRVJfTk9UX0ZPVU5EX0VSUk9SX01FU1NBR0UnKSwgKCdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX0xJTUlUX0VYQ0VFREVEX0VSUk9SX01FU1NBR0UnLCAnUkVDVVJSRU5UX1BBWU1FTlRfUFJPQ0VFRElOR19MSU1JVF9FWENFRURFRF9FUlJPUl9NRVNTQUdFJyksICgnUkVDVVJSRU5UX1BBWU1FTlRfUFJPQ0VFRElOR19DT05URVhUX05PVF9GT1VORF9FUlJPUl9NRVNTQUdFJywgJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfQ09OVEVYVF9OT1RfRk9VTkRfRVJST1JfTUVTU0FHRScpLCAoJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfQ09OVEVYVF9ESVNBQkxFRF9FUlJPUl9NRVNTQUdFJywgJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfQ09OVEVYVF9ESVNBQkxFRF9FUlJPUl9NRVNTQUdFJyksICgnUkVDVVJSRU5UX1BBWU1FTlRfUFJPQ0VFRElOR19DQVJEX1RPS0VOX05PVF9WQUxJRF9FUlJPUl9NRVNTQUdFJywgJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfQ0FSRF9UT0tFTl9OT1RfVkFMSURfRVJST1JfTUVTU0FHRScpLCAoJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfQ0FOX05PVF9SRUdJU1RFUl9NVUxUSV9QQVlNRU5UX0VSUk9SX01FU1NBR0UnLCAnUkVDVVJSRU5UX1BBWU1FTlRfUFJPQ0VFRElOR19DQU5fTk9UX1JFR0lTVEVSX01VTFRJX1BBWU1FTlRfRVJST1JfTUVTU0FHRScpLCAoJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfTk9fUkVDRUlQVFNfVE9fUFJPQ0VFRF9FUlJPUl9NRVNTQUdFJywgJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfTk9fUkVDRUlQVFNfVE9fUFJPQ0VFRF9FUlJPUl9NRVNTQUdFJyksICgnUkVDVVJSRU5UX1BBWU1FTlRfVE9NT1JST1dfUEFZTUVOVF9NRVNTQUdFJywgJ1JFQ1VSUkVOVF9QQVlNRU5UX1RPTU9SUk9XX1BBWU1FTlRfTUVTU0FHRScpLCAoJ1JFQ1VSUkVOVF9QQVlNRU5UX1RPTU9SUk9XX1BBWU1FTlRfTk9fUkVDRUlQVFNfTUVTU0FHRScsICdSRUNVUlJFTlRfUEFZTUVOVF9UT01PUlJPV19QQVlNRU5UX05PX1JFQ0VJUFRTX01FU1NBR0UnKSwgKCdSRUNVUlJFTlRfUEFZTUVOVF9UT01PUlJPV19QQVlNRU5UX0xJTUlUX0VYQ0VFRF9NRVNTQUdFJywgJ1JFQ1VSUkVOVF9QQVlNRU5UX1RPTU9SUk9XX1BBWU1FTlRfTElNSVRfRVhDRUVEX01FU1NBR0UnKSwgKCdORVdTX0lURU1fQ09NTU9OX01FU1NBR0VfVFlQRScsICdORVdTX0lURU1fQ09NTU9OX01FU1NBR0VfVFlQRScpLCAoJ05FV1NfSVRFTV9FTUVSR0VOQ1lfTUVTU0FHRV9UWVBFJywgJ05FV1NfSVRFTV9FTUVSR0VOQ1lfTUVTU0FHRV9UWVBFJyksICgnREVWX1BPUlRBTF9NRVNTQUdFJywgJ0RFVl9QT1JUQUxfTUVTU0FHRScpLCAoJ1NFTkRfQklMTElOR19SRUNFSVBUU19PTl9QQVlEQVlfUkVNSU5ERVJfTUVTU0FHRScsICdTRU5EX0JJTExJTkdfUkVDRUlQVFNfT05fUEFZREFZX1JFTUlOREVSX01FU1NBR0UnKSwgKCdNQVJLRVRQTEFDRV9JTlZPSUNFX1BVQkxJU0hFRF9NRVNTQUdFJywgJ01BUktFVFBMQUNFX0lOVk9JQ0VfUFVCTElTSEVEX01FU1NBR0UnKSwgKCdNQVJLRVRQTEFDRV9JTlZPSUNFX1dJVEhfVElDS0VUX1BVQkxJU0hFRF9NRVNTQUdFJywgJ01BUktFVFBMQUNFX0lOVk9JQ0VfV0lUSF9USUNLRVRfUFVCTElTSEVEX01FU1NBR0UnKSwgKCdNQVJLRVRQTEFDRV9JTlZPSUNFX0NBU0hfUFVCTElTSEVEX01FU1NBR0UnLCAnTUFSS0VUUExBQ0VfSU5WT0lDRV9DQVNIX1BVQkxJU0hFRF9NRVNTQUdFJyksICgnTUFSS0VUUExBQ0VfSU5WT0lDRV9DQVNIX1dJVEhfVElDS0VUX1BVQkxJU0hFRF9NRVNTQUdFJywgJ01BUktFVFBMQUNFX0lOVk9JQ0VfQ0FTSF9XSVRIX1RJQ0tFVF9QVUJMSVNIRURfTUVTU0FHRScpLCAoJ1NFUlZJQ0VfVVNFUl9DUkVBVEVEJywgJ1NFUlZJQ0VfVVNFUl9DUkVBVEVEJyldLCBtYXhfbGVuZ3RoPTEwMCwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWx0ZXJGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nbm90aWZpY2F0aW9udXNlcnNldHRpbmcnLAogICAgICAgICAgICBuYW1lPSdtZXNzYWdlVHlwZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5DaGFyRmllbGQoYmxhbms9VHJ1ZSwgY2hvaWNlcz1bKCdUSUNLRVRfQ1JFQVRFRCcsICdUSUNLRVRfQ1JFQVRFRCcpLCAoJ1RJQ0tFVF9DT01NRU5UX0NSRUFURUQnLCAnVElDS0VUX0NPTU1FTlRfQ1JFQVRFRCcpLCAoJ0lOVklURV9ORVdfRU1QTE9ZRUUnLCAnSU5WSVRFX05FV19FTVBMT1lFRScpLCAoJ1NIQVJFX1RJQ0tFVCcsICdTSEFSRV9USUNLRVQnKSwgKCdCQU5LX0FDQ09VTlRfQ1JFQVRJT05fUkVRVUVTVCcsICdCQU5LX0FDQ09VTlRfQ1JFQVRJT05fUkVRVUVTVCcpLCAoJ0RJUlRZX0lOVklURV9ORVdfRU1QTE9ZRUVfU01TJywgJ0RJUlRZX0lOVklURV9ORVdfRU1QTE9ZRUVfU01TJyksICgnRElSVFlfSU5WSVRFX05FV19FTVBMT1lFRV9FTUFJTCcsICdESVJUWV9JTlZJVEVfTkVXX0VNUExPWUVFX0VNQUlMJyksICgnUkVHSVNURVJfTkVXX1VTRVInLCAnUkVHSVNURVJfTkVXX1VTRVInKSwgKCdSRVNFVF9QQVNTV09SRCcsICdSRVNFVF9QQVNTV09SRCcpLCAoJ1NNU19WRVJJRlknLCAnU01TX1ZFUklGWScpLCAoJ0RFVkVMT1BFUl9JTVBPUlRBTlRfTk9URV9UWVBFJywgJ0RFVkVMT1BFUl9JTVBPUlRBTlRfTk9URV9UWVBFJyksICgnQ1VTVE9NRVJfSU1QT1JUQU5UX05PVEVfVFlQRScsICdDVVNUT01FUl9JTVBPUlRBTlRfTk9URV9UWVBFJyksICgnTUVTU0FHRV9GT1JXQVJERURfVE9fU1VQUE9SVCcsICdNRVNTQUdFX0ZPUldBUkRFRF9UT19TVVBQT1JUJyksICgnVElDS0VUX0FTU0lHTkVFX0NPTk5FQ1RFRCcsICdUSUNLRVRfQVNTSUdORUVfQ09OTkVDVEVEJyksICgnVElDS0VUX0VYRUNVVE9SX0NPTk5FQ1RFRCcsICdUSUNLRVRfRVhFQ1VUT1JfQ09OTkVDVEVEJyksICgnVFJBQ0tfVElDS0VUX0lOX0RPTUFfQVBQJywgJ1RSQUNLX1RJQ0tFVF9JTl9ET01BX0FQUCcpLCAoJ1RJQ0tFVF9TVEFUVVNfT1BFTkVEJywgJ1RJQ0tFVF9TVEFUVVNfT1BFTkVEJyksICgnVElDS0VUX1NUQVRVU19JTl9QUk9HUkVTUycsICdUSUNLRVRfU1RBVFVTX0lOX1BST0dSRVNTJyksICgnVElDS0VUX1NUQVRVU19DT01QTEVURUQnLCAnVElDS0VUX1NUQVRVU19DT01QTEVURUQnKSwgKCdUSUNLRVRfU1RBVFVTX1JFVFVSTkVEJywgJ1RJQ0tFVF9TVEFUVVNfUkVUVVJORUQnKSwgKCdUSUNLRVRfU1RBVFVTX0RFQ0xJTkVEJywgJ1RJQ0tFVF9TVEFUVVNfREVDTElORUQnKSwgKCdUSUNLRVRfQ09NTUVOVF9BRERFRCcsICdUSUNLRVRfQ09NTUVOVF9BRERFRCcpLCAoJ01FVEVSX1ZFUklGSUNBVElPTl9EQVRFX1JFTUlOREVSJywgJ01FVEVSX1ZFUklGSUNBVElPTl9EQVRFX1JFTUlOREVSJyksICgnUkVTSURFTlRfQUREX0JJTExJTkdfQUNDT1VOVCcsICdSRVNJREVOVF9BRERfQklMTElOR19BQ0NPVU5UJyksICgnQklMTElOR19SRUNFSVBUX0FWQUlMQUJMRScsICdCSUxMSU5HX1JFQ0VJUFRfQVZBSUxBQkxFJyksICgnQklMTElOR19SRUNFSVBUX0FWQUlMQUJMRV9OT19BQ0NPVU5UJywgJ0JJTExJTkdfUkVDRUlQVF9BVkFJTEFCTEVfTk9fQUNDT1VOVCcpLCAoJ0JJTExJTkdfUkVDRUlQVF9DQVRFR09SWV9BVkFJTEFCTEUnLCAnQklMTElOR19SRUNFSVBUX0NBVEVHT1JZX0FWQUlMQUJMRScpLCAoJ0JJTExJTkdfUkVDRUlQVF9BRERFRCcsICdCSUxMSU5HX1JFQ0VJUFRfQURERUQnKSwgKCdCSUxMSU5HX1JFQ0VJUFRfRklMRV9BRERFRCcsICdCSUxMSU5HX1JFQ0VJUFRfRklMRV9BRERFRCcpLCAoJ0JJTExJTkdfUkVDRUlQVF9BRERFRF9XSVRIX0RFQlQnLCAnQklMTElOR19SRUNFSVBUX0FEREVEX1dJVEhfREVCVCcpLCAoJ0JJTExJTkdfUkVDRUlQVF9BRERFRF9XSVRIX05PX0RFQlQnLCAnQklMTElOR19SRUNFSVBUX0FEREVEX1dJVEhfTk9fREVCVCcpLCAoJ01FVEVSX1NVQk1JVF9SRUFESU5HU19SRU1JTkRFUicsICdNRVRFUl9TVUJNSVRfUkVBRElOR1NfUkVNSU5ERVInKSwgKCdNRVRFUl9TVUJNSVRfUkVBRElOR1NfUkVNSU5ERVJfU1RBUlRfUEVSSU9EJywgJ01FVEVSX1NVQk1JVF9SRUFESU5HU19SRU1JTkRFUl9TVEFSVF9QRVJJT0QnKSwgKCdNRVRFUl9TVUJNSVRfUkVBRElOR1NfUkVNSU5ERVJfRU5EX1BFUklPRCcsICdNRVRFUl9TVUJNSVRfUkVBRElOR1NfUkVNSU5ERVJfRU5EX1BFUklPRCcpLCAoJ01FVEVSX1ZFUklGSUNBVElPTl9EQVRFX0VYUElSRUQnLCAnTUVURVJfVkVSSUZJQ0FUSU9OX0RBVEVfRVhQSVJFRCcpLCAoJ1JFU0lERU5UX1VQR1JBREVfQVBQJywgJ1JFU0lERU5UX1VQR1JBREVfQVBQJyksICgnU1RBRkZfVVBHUkFERV9BUFAnLCAnU1RBRkZfVVBHUkFERV9BUFAnKSwgKCdDVVNUT01fQ09OVEVOVF9NRVNTQUdFX1BVU0gnLCAnQ1VTVE9NX0NPTlRFTlRfTUVTU0FHRV9QVVNIJyksICgnTU9CSUxFX0FQUF9VUERBVEVfQVZBSUxBQkxFX01FU1NBR0VfUFVTSCcsICdNT0JJTEVfQVBQX1VQREFURV9BVkFJTEFCTEVfTUVTU0FHRV9QVVNIJyksICgnQ1VTVE9NX0NPTlRFTlRfTUVTU0FHRV9FTUFJTCcsICdDVVNUT01fQ09OVEVOVF9NRVNTQUdFX0VNQUlMJyksICgnQ1VTVE9NX0NPTlRFTlRfTUVTU0FHRV9TTVMnLCAnQ1VTVE9NX0NPTlRFTlRfTUVTU0FHRV9TTVMnKSwgKCdWT0lQX0lOQ09NSU5HX0NBTExfTUVTU0FHRScsICdWT0lQX0lOQ09NSU5HX0NBTExfTUVTU0FHRScpLCAoJ0IyQ19BUFBfTUVTU0FHRV9QVVNIJywgJ0IyQ19BUFBfTUVTU0FHRV9QVVNIJyksICgnUkVDVVJSRU5UX1BBWU1FTlRfUFJPQ0VFRElOR19TVUNDRVNTX1JFU1VMVF9NRVNTQUdFJywgJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfU1VDQ0VTU19SRVNVTFRfTUVTU0FHRScpLCAoJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfVU5LTk9XTl9FUlJPUl9NRVNTQUdFJywgJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfVU5LTk9XTl9FUlJPUl9NRVNTQUdFJyksICgnUkVDVVJSRU5UX1BBWU1FTlRfUFJPQ0VFRElOR19BQ1FVSVJJTkdfUEFZTUVOVF9QUk9DRUVEX0VSUk9SX01FU1NBR0UnLCAnUkVDVVJSRU5UX1BBWU1FTlRfUFJPQ0VFRElOR19BQ1FVSVJJTkdfUEFZTUVOVF9QUk9DRUVEX0VSUk9SX01FU1NBR0UnKSwgKCdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX1NFUlZJQ0VfQ09OU1VNRVJfTk9UX0ZPVU5EX0VSUk9SX01FU1NBR0UnLCAnUkVDVVJSRU5UX1BBWU1FTlRfUFJPQ0VFRElOR19TRVJWSUNFX0NPTlNVTUVSX05PVF9GT1VORF9FUlJPUl9NRVNTQUdFJyksICgnUkVDVVJSRU5UX1BBWU1FTlRfUFJPQ0VFRElOR19MSU1JVF9FWENFRURFRF9FUlJPUl9NRVNTQUdFJywgJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfTElNSVRfRVhDRUVERURfRVJST1JfTUVTU0FHRScpLCAoJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfQ09OVEVYVF9OT1RfRk9VTkRfRVJST1JfTUVTU0FHRScsICdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX0NPTlRFWFRfTk9UX0ZPVU5EX0VSUk9SX01FU1NBR0UnKSwgKCdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX0NPTlRFWFRfRElTQUJMRURfRVJST1JfTUVTU0FHRScsICdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX0NPTlRFWFRfRElTQUJMRURfRVJST1JfTUVTU0FHRScpLCAoJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfQ0FSRF9UT0tFTl9OT1RfVkFMSURfRVJST1JfTUVTU0FHRScsICdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX0NBUkRfVE9LRU5fTk9UX1ZBTElEX0VSUk9SX01FU1NBR0UnKSwgKCdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX0NBTl9OT1RfUkVHSVNURVJfTVVMVElfUEFZTUVOVF9FUlJPUl9NRVNTQUdFJywgJ1JFQ1VSUkVOVF9QQVlNRU5UX1BST0NFRURJTkdfQ0FOX05PVF9SRUdJU1RFUl9NVUxUSV9QQVlNRU5UX0VSUk9SX01FU1NBR0UnKSwgKCdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX05PX1JFQ0VJUFRTX1RPX1BST0NFRURfRVJST1JfTUVTU0FHRScsICdSRUNVUlJFTlRfUEFZTUVOVF9QUk9DRUVESU5HX05PX1JFQ0VJUFRTX1RPX1BST0NFRURfRVJST1JfTUVTU0FHRScpLCAoJ1JFQ1VSUkVOVF9QQVlNRU5UX1RPTU9SUk9XX1BBWU1FTlRfTUVTU0FHRScsICdSRUNVUlJFTlRfUEFZTUVOVF9UT01PUlJPV19QQVlNRU5UX01FU1NBR0UnKSwgKCdSRUNVUlJFTlRfUEFZTUVOVF9UT01PUlJPV19QQVlNRU5UX05PX1JFQ0VJUFRTX01FU1NBR0UnLCAnUkVDVVJSRU5UX1BBWU1FTlRfVE9NT1JST1dfUEFZTUVOVF9OT19SRUNFSVBUU19NRVNTQUdFJyksICgnUkVDVVJSRU5UX1BBWU1FTlRfVE9NT1JST1dfUEFZTUVOVF9MSU1JVF9FWENFRURfTUVTU0FHRScsICdSRUNVUlJFTlRfUEFZTUVOVF9UT01PUlJPV19QQVlNRU5UX0xJTUlUX0VYQ0VFRF9NRVNTQUdFJyksICgnTkVXU19JVEVNX0NPTU1PTl9NRVNTQUdFX1RZUEUnLCAnTkVXU19JVEVNX0NPTU1PTl9NRVNTQUdFX1RZUEUnKSwgKCdORVdTX0lURU1fRU1FUkdFTkNZX01FU1NBR0VfVFlQRScsICdORVdTX0lURU1fRU1FUkdFTkNZX01FU1NBR0VfVFlQRScpLCAoJ0RFVl9QT1JUQUxfTUVTU0FHRScsICdERVZfUE9SVEFMX01FU1NBR0UnKSwgKCdTRU5EX0JJTExJTkdfUkVDRUlQVFNfT05fUEFZREFZX1JFTUlOREVSX01FU1NBR0UnLCAnU0VORF9CSUxMSU5HX1JFQ0VJUFRTX09OX1BBWURBWV9SRU1JTkRFUl9NRVNTQUdFJyksICgnTUFSS0VUUExBQ0VfSU5WT0lDRV9QVUJMSVNIRURfTUVTU0FHRScsICdNQVJLRVRQTEFDRV9JTlZPSUNFX1BVQkxJU0hFRF9NRVNTQUdFJyksICgnTUFSS0VUUExBQ0VfSU5WT0lDRV9XSVRIX1RJQ0tFVF9QVUJMSVNIRURfTUVTU0FHRScsICdNQVJLRVRQTEFDRV9JTlZPSUNFX1dJVEhfVElDS0VUX1BVQkxJU0hFRF9NRVNTQUdFJyksICgnTUFSS0VUUExBQ0VfSU5WT0lDRV9DQVNIX1BVQkxJU0hFRF9NRVNTQUdFJywgJ01BUktFVFBMQUNFX0lOVk9JQ0VfQ0FTSF9QVUJMSVNIRURfTUVTU0FHRScpLCAoJ01BUktFVFBMQUNFX0lOVk9JQ0VfQ0FTSF9XSVRIX1RJQ0tFVF9QVUJMSVNIRURfTUVTU0FHRScsICdNQVJLRVRQTEFDRV9JTlZPSUNFX0NBU0hfV0lUSF9USUNLRVRfUFVCTElTSEVEX01FU1NBR0UnKSwgKCdTRVJWSUNFX1VTRVJfQ1JFQVRFRCcsICdTRVJWSUNFX1VTRVJfQ1JFQVRFRCcpXSwgbWF4X2xlbmd0aD0xMDAsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field message on messagebatch
--
ALTER TABLE "MessageBatch" ALTER COLUMN "message" DROP NOT NULL;
--
-- Alter field messageType on messagebatch
--
-- (no-op)
--
-- Alter field title on messagebatch
--
ALTER TABLE "MessageBatch" ALTER COLUMN "title" DROP NOT NULL;
--
-- Alter field messageType on notificationanonymoussetting
--
-- (no-op)
--
-- Alter field messageType on notificationusersetting
--
-- (no-op)
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field messageType on notificationusersetting
--
-- (no-op)
--
-- Alter field messageType on notificationanonymoussetting
--
-- (no-op)
--
-- Alter field title on messagebatch
--
ALTER TABLE "MessageBatch" ALTER COLUMN "title" SET NOT NULL;
--
-- Alter field messageType on messagebatch
--
-- (no-op)
--
-- Alter field message on messagebatch
--
ALTER TABLE "MessageBatch" ALTER COLUMN "message" SET NOT NULL;
COMMIT;

    `)
}
