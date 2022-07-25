import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  ItemBought as ItemBoughtEvent,
  ItemListed as ItemListedEvent,
  ItemRemoved as ItemRemovedEvent
} from "../generated/NFTMarketplace/NFTMarketplace"
import { ItemBought, ItemListed, ItemRemoved, ActiveItem } from "../generated/schema";

export function handleItemBought(event: ItemBoughtEvent): void {
  // save the event in our graph update activeitem table
  // get itembought object
  // we have to make an id for each event we'd with getIdfromparams()
  let itemBought = ItemBought.load(getIdFromParams(event.params.tokenId_, event.params.nftAddress_)) // we load an object using its id
  let activeItem = ActiveItem.load(getIdFromParams(event.params.tokenId_, event.params.nftAddress_))
  // remember we must also list in activeitem
  if(!itemBought){
    itemBought = new ItemBought(getIdFromParams(event.params.tokenId_, event.params.nftAddress_)) // new document from the 
    // ItemBought schema 
  }
  // v populating the fields with their values
  itemBought.buyer = event.params.buyer_
  itemBought.nftAddress = event.params.nftAddress_
  itemBought.tokenId = event.params.tokenId_
  // v for an ItemBought its corresponding activeItem will already exist
  activeItem!.buyer = event.params.buyer_
  // ^ ! means activeItem must exist
  // we won't be removing the nft from activeitems table instead we'd just check whether or not its been bought
  // using the activeitem.buyer method
  
  itemBought.save()
  activeItem!.save()
}

export function handleItemListed(event: ItemListedEvent): void {
  let itemListed = ItemListed.load(getIdFromParams(event.params.tokenId_, event.params.nftAddress_))
  let activeItem = ActiveItem.load(getIdFromParams(event.params.tokenId_, event.params.nftAddress_))
  if(!itemListed){
    itemListed = new ItemListed(getIdFromParams(event.params.tokenId_, event.params.nftAddress_))
  }
  // v activeitem document will not exist if respective itemlisted document doesnt exist
  if(!activeItem){
    activeItem = new ActiveItem(getIdFromParams(event.params.tokenId_, event.params.nftAddress_))
  }
  // v populating the fields with their values
  itemListed.seller = event.params.seller_
  activeItem.seller = event.params.seller_

  itemListed.nftAddress = event.params.nftAddress_
  activeItem.nftAddress = event.params.nftAddress_

  itemListed.tokenId = event.params.tokenId_
  activeItem.tokenId = event.params.tokenId_

  itemListed.price = event.params.price_
  activeItem.price = event.params.price_

  // since it hasn't been bought yet activeItem's bought field will have the zero address
  activeItem.buyer = Address.fromString("0x0000000000000000000000000000000000000000")

  itemListed.save()
  activeItem.save()
}

export function handleItemRemoved(event: ItemRemovedEvent): void {
  let itemRemoved = ItemRemoved.load(getIdFromParams(event.params.tokenId_, event.params.nftAddress_))
  let activeItem = ActiveItem.load(getIdFromParams(event.params.tokenId_, event.params.nftAddress_))
  if(!itemRemoved){
    itemRemoved = new ItemRemoved(getIdFromParams(event.params.tokenId_, event.params.nftAddress_))
  }

  itemRemoved.seller = event.params.seller_
  itemRemoved.nftAddress = event.params.nftAddress_
  itemRemoved.tokenId = event.params.tokenId_
  // v for an ItemRemoved its corresponding activeItem will already exist
  activeItem!.buyer = Address.fromString("0x000000000000000000000000000000000000dEaD")
  // ^ if it has been removed we update it buyer field with the dead address 
  // (its different from the zero address as it suffices with the dEaD keyword)
  // we'll use it as an indicator on our front end
  itemRemoved.save()
  activeItem!.save()
}

function getIdFromParams(tokenId: BigInt, nftAddress: Address): string {
  // ^ params are declared with their type and string is the return type
  return tokenId.toHexString() + nftAddress.toHexString()
  // ^ that's how we make our id
}
