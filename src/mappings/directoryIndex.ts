import {
  SegmentAdded,
  SegmentRemoved,
} from '../../generated/DirectoryIndex/DirectoryIndex'
import { ArbitrableDirectory as ArbitrableDirectoryTemplate} from '../../generated/templates'
import { ArbitrableDirectory as ArbitrableDirectoryContract} from '../../generated/templates/ArbitrableDirectory/ArbitrableDirectory'
import { Directory } from '../../generated/schema'
import { Address } from "@graphprotocol/graph-ts"

function safeGetDirectory(directoryAddress: Address): Directory {
  let directory = Directory.load(directoryAddress.toHexString())
  if(!directory) {
    directory = new Directory(directoryAddress.toHexString())
  }
  return directory as Directory
}

// Handle the addition of a new segment
export function handleDirectoryAdded(event: SegmentAdded): void {

  // Get the contract using its address
  let directoryContract = ArbitrableDirectoryContract.bind(event.params.segment)
  if(directoryContract) {
    // Create the directory entity
    let directory = safeGetDirectory(event.params.segment)
    directory.isRemoved = false
    directory.addedAtTimestamp = event.block.timestamp
    directory.addedAtBlockNumber = event.block.number
    directory.name = directoryContract.getSegment()
    directory.save()

    // Start indexing this directory contract using the data source template
    ArbitrableDirectoryTemplate.create(event.params.segment)
  }

}

// Handle the removal of a segment
export function handleDirectoryRemoved(event: SegmentRemoved): void {
  let directory = safeGetDirectory(event.params.segment)
  directory.isRemoved = true
  directory.removedAtTimestamp = event.block.timestamp
  directory.removedAtBlockNumber = event.block.number
  directory.save()
}
