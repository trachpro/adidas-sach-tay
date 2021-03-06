import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { BillService } from '../../../api/bill.service';
import { BillDetailService } from '../../../api/bill-detail.service';
import { PopupService } from '../../popup/popup.service';
import { LoadingService } from '../../../util/loading.service';
import { StorageService } from '../../../util/storage.service';

declare let $: any;

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  private billDetailList: any = [{
    productId: '',
    quantity: 1,
    link: '',
    price: 0,
    keepBox: true,
    billId: null,
    code: 0,
    webFee: 0,
    afterCodePrice: 0,
    total: 0
  }];

  private exchangeValue: number;
  private exchangeId: number;

  private isError = false;
  private isNew = false;
  private Number = Number
  private console = console
  private message = ''

  constructor(
    private dialogRef: MatDialogRef<UploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private billService: BillService,
    private billDetailService: BillDetailService,
    private popupDialog: PopupService,
    private loading: LoadingService,
    private storageService: StorageService,
    private cdRef:ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log("data: ", this.data);

    this.exchangeValue = this.storageService.get('exchangeValue') - -this.data.user.exchangeOdds;
    this.exchangeId = this.storageService.get('exchangeId');
    

    this.billDetailList[0].userId = this.data.user.id;

    if(this.data.bill && this.data.bill.id && this.data.bill.billdetail) {

      this.billDetailList = this.data.bill.billdetail;

    }

    if(!this.data.bill) {

      this.data.bill = {
        createdDate: this.getTime(),
        userId: this.data.user.id,
        status: 2,
        deposit: 0,
        shipFee: 0,
        brand: 'adidas-jp',
        surcharge: 0,
        exchangeRate: this.exchangeValue,
        weight: 0,
        unitPrice: 0,
        // billName: '',
        total: 0,
        helpFee: this.data.user.helpFee? this.data.user.helpFee: 1
      }
    }
  }

  ngAfterViewInit() {

    $('app-upload').parent().parent().attr('id','upload');
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  toggleKeepBox(item) {
    item.keepBox = !item.keepBox
  }

  replaceCommas(event) {
    return event.replace(/,/g, "")
  }

  onClick() {

    this.dialogRef.close();
  }

  getTime() {

    let a = new Date;

    return a;
  }

  addProduct(data) {
    if (this.data.bill.reservationId) {
      this.popupDialog.showError("Không thể thêm sản phẩm khi nó đã được giao đặt hàng")
      return
    }
    data = JSON.parse(JSON.stringify(data))
    data.billId = null;
    this.billDetailList.push(data);
  }

  deleteProduct(data) {

    if (this.data.bill.reservationId) {
      this.popupDialog.showError("không thể xóa sản phẩm khi nó đã được giao đặt hàng")
      return
    }

    if(data.billId) {

      this.loading.show('upload');

      this.billDetailService.delete(data).subscribe(del => {

        this.loading.hide('upload');

        this.billDetailList.splice(this.billDetailList.indexOf(data),1);
        this.dialogRef.updateSize()
        if (this.billDetailList.length == 0) {
          this.dialogRef.close(-2); // remove signal
        } else {
          this.dialogRef.close(1) // update signal
        }
      }, error => {
        console.log(error)
        this.popupDialog.showError("có lỗi xảy ra! Xin thử lại");
        this.loading.hide('upload');
      })
    } else {

      this.billDetailList.splice(this.billDetailList.indexOf(data), 1);

      if (this.billDetailList.length == 0) {

        this.dialogRef.close();
      }
    }
    
    
  }

  checkValid() {

    const checkingArray = []

    for(let i = 0; i< this.billDetailList.length; i++) {

      if(!this.billDetailList[i].productId || !this.billDetailList[i].quantity) {
        this.message = 'mã sản phẩm và số lượng không được để trống!'
        return false;
      }

      if (!checkingArray.includes(this.billDetailList[i].productId)) {
        checkingArray.push(this.billDetailList[i].productId)
      }
    }

    if(checkingArray.length != this.billDetailList.length) {
      this.message = 'mã sản phẩm đang bị trùng nhau, xin thử lại'
      return false
    }

    return true;
  }

  totalPricePerItem(item) {

    if (this.data.user.role != 'client') {
      item.total = ((item.code * item.price + item.webFee) * this.data.bill.exchangeRate * this.data.bill.helpFee + this.data.bill.surcharge) * item.quantity
    }
    return item.total
  }

  registOrUpdate() {

    let countErr = 0;
    let countSuc = 0;

    this.billDetailList.forEach( element => {

      if(!element.weight) {
        element.weight = 0
      }

      if(!element.price) {
        element.price = 0
      }

      element.keepBox = element.keepBox? element.quantity: 0;
      if(element.billId) {

        this.billDetailService.update(element).subscribe( data => {

          countSuc += 1;

          if(countSuc == this.billDetailList.length) {

            this.showSuccess();
          } else if(countSuc + countErr == this.billDetailList.length) {

            this.showSuccess();
          }
        }, error => {

          countErr += 1;

          if(countSuc + countErr == this.billDetailList.length) {

            this.showSuccess()
          }       
        })
      } else {

        element.billId = this.data.bill.id;
        this.billDetailService.create(element).subscribe( data => {

          countSuc += 1;

          if(countSuc == this.billDetailList.length) {

            this.showSuccess();
          } else if(countSuc + countErr == this.billDetailList.length) {

            this.showError();
          }
        }, error => {

          element.billId = null;
          countErr += 1;

          if(countSuc + countErr == this.billDetailList.length) {

            this.showError();
          }      
        })
      }
    })
  }

  regist() {

    if(!this.checkValid()) {
      this.popupDialog.showError(this.message)
      return
    };

    this.loading.show('upload');
    if(this.data.bill && this.data.bill.id) {

      this.billService.update(this.data.bill).subscribe( data => {

        console.log("put data bill: ", data);
        this.registOrUpdate();
      }, error => {

        this.loading.hide('upload');
        this.popupDialog.showError(error.message);
      })
    } else {

      this.billService.create(this.data.bill).subscribe( data => {

        this.isNew = true;
        console.log("create data bill: ", data);
        this.data.bill.id = data.id;
        this.data.bill.billdetail = this.billDetailList;
        this.registOrUpdate();
      }, error => {

        this.popupDialog.showError(error.message);
        this.loading.hide('upload');
      })
    }
  }

  showError() {

    this.loading.hide('upload');
    this.dialogRef.updateSize()
    this.popupDialog.showError("có lỗi xảy ra").subscribe( data => {

      console.log("close error!");
    })
  }

  showSuccess() {

    this.loading.hide('upload');
    this.dialogRef.updateSize()
    this.popupDialog.showSuccess().subscribe( data => {

      if(this.isNew) {

          this.dialogRef.close(this.data.bill);
      }else {

          this.dialogRef.close(1);
      }
    })
  }

  calculate() {

    let sum = 0;
    this.billDetailList.forEach( element => {

      sum += element.total
    });

    return sum + this.data.bill.unitPrice * this.data.bill.weight + this.data.bill.shipFee
  }

}
