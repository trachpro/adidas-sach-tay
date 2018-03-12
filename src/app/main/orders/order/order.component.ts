import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Observable}     from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

//service
import { BillService } from '../../../core/api/bill.service';
import { BillDetailService } from '../../../core/api/bill-detail.service';
import { OrderService } from '../../../core/api/order.service';
import { OrderDetailService } from '../../../core/api/order-detail.service'; 
import { UserService } from '../../../core/api/user.service';
import { LoadingService } from '../../../core/util/loading.service';
import { PopupService } from '../../../core/dialog/popup/popup.service';

declare let $: any;

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  listBooked = [];
  result = [];

  counter = 0;

  constructor(
    private userService: UserService,
    private billService: BillService,
    private billDetailService: BillDetailService,
    private orderService: OrderService,
    private orderDetailService: OrderDetailService,
    private dialogRef: MatDialogRef<OrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loadingService: LoadingService,
    private popupService: PopupService
  ) { }

  ngOnInit() {

    console.log("init order data: ", this.data);
    $('app-order').parent().parent().attr('id','app-order');

    setTimeout( () => this.loadingService.show('app-order'), 0);

    this.billService.search({madh: this.data.madh}).subscribe( data => {

      let i = 0;
      console.log("data bill Service: ", data);
      this.listBooked = data;

      let userList: any = {};

      this.listBooked.forEach( element => {

        if(userList[element.makh]) {

          element.user = userList[element.makh];
        } else {

          userList[element.makh] = {};

          this.userService.getById(element.makh).subscribe(user => {

            console.log("user :", element.makh, user);element.user = user.data;

            for(let e in user.data) {

              userList[element.makh][e] = user.data[e];
            }
            
            element.user = userList[element.makh];
          });
        }
        
        this.billDetailService.getByParams({mahd: element.mahd}).subscribe ( bills => {

          i++;
          element.bills = bills;

          if(i == this.listBooked.length) {

            this.loadingService.hide('app-order');
          }
        })
      })
    })

    this.orderDetailService.getByParams({madh: this.data.madh}).subscribe( data => {

      console.log("don hang chi tiet: ", data);
      this.result = data;
    })
  }

  selectItem(item) {

    item.madh = item.madh? null: this.data.madh;
    item.bills.forEach(elem => {

      let flag = true;
      this.result.forEach(element => {

        if (element.masp == elem.masp) {

          flag = false;
          if(item.madh) {

            element.soluong += elem.soluong;
            element.giuhop += elem.giuhop;
          } else {

            if(element.soluong == elem.soluong) {

              this.result.splice(this.result.indexOf(element), 1);
            } else {

              element.soluong -= elem.soluong;
              element.giuhop -= elem.giuhop;
            }
          }
          return;
        }
      })

      if(flag) {

        this.result.push({
          masp: elem.masp,
          soluong: elem.soluong,
          giuhop: elem.giuhop,
          madh: this.data.madh,
          makh: this.data.makh
        })
      }
      
    })

    console.log("result: ", this.result);
  }

  checkAndCountNum(billDetail) {

    let flag = true;

    this.result.forEach(element => {

      if(element.masp == billDetail.masp) {

        flag = false;
        element.flag = true;
      }
    })

    if(flag) {

      this.result.push({
        masp: billDetail.masp,
        soluong: 0,
        giuhop: 0
      })

      this.checkAndCountNum(billDetail);
    }
  }

  selectAll() {

    let flag = true;

    this.listBooked.forEach( element => {

      if(!element.madh) {

        flag = false;
        return;
      }
    })

    this.listBooked.forEach( element => {

      if(flag) {

        this.selectItem(element);
      } else {

        if(!element.madh) {
          
          this.selectItem(element);
        }
      }
    })
  }

  returnArray(): Array<any> {

    return this.listBooked.filter( element => {

      return element.madh? false: true;
    })
  }

  promisList(): Array<any> {

    let a = [];

    this.returnArray().forEach( element => {

      a.push(this.billService.update(element));
    })

    console.log("a: ", a);
    return a;
  }

  async submit() {

    this.loadingService.show('app-order');
    let flag = true;

    let result = await Observable.forkJoin(...this.promisList()).toPromise().then( data => {

      this.counter ++;
      
      this.returnArray().forEach( element => {

        element.bills.forEach(elem => {

          this.checkAndCountNum(elem);
        });
      })
    })
    
    this.checkOrder();
  }

  updateProductList(): Array<any> {

    return this.result.filter( element => {

      return element.flag? true: false;
    }) 
  }

  obserProductList(): Array<any> {

    let a = [];

    this.updateProductList().forEach(element => {
      
      if(element.soluong == 0) {

        a.push(this.orderDetailService.delete({madh: this.data.madh, masp: element.masp}))
      } else {

        element.madh = this.data.madh;
        a.push(this.orderDetailService.update(element));
      }
    });

    return a;
  }


  async checkOrder() {

    await Observable.forkJoin(...this.obserProductList()).toPromise().then( data => {

      console.log("data: checkORder: ", data);
    }).catch( error => {

      console.log("catch: ", error);
    })

    let flag = true;

    this.result.forEach( element => {

      if(element.soluong) {

        flag = false;
        return;
      }
    })

    if(flag) {

      this.orderService.delete(this.data.madh).subscribe( data => {

        console.log("delete order: ", data);

        this.loadingService.hide('app-order');
        this.popupService.showSuccess().subscribe( data => {

          console.log("success: ", data);
          this.dialogRef.close(2);
        })
      }, error => {

        this.loadingService.hide('app-order');
        this.popupService.showError();
      })
    } else {

      this.orderService.update(this.data).subscribe( data => {

        console.log("update order: ", data);

        this.loadingService.hide('app-order');
        this.popupService.showSuccess().subscribe( data => {

          this.dialogRef.close(1);
        })
      }, error => {

        this.loadingService.hide('app-order');
        this.popupService.showError();
      })
    }
  }
}