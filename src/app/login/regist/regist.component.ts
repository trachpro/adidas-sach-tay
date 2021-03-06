import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/api/user.service';
import { StorageService } from '../../core/util/storage.service';
import { LoadingService } from '../../core/util/loading.service';
import { PopupService } from '../../core/dialog/popup/popup.service';
import { Router } from '@angular/router';
declare let $: any;

@Component({
  selector: 'app-regist',
  templateUrl: './regist.component.html',
  styleUrls: ['./regist.component.css']
})
export class RegistComponent implements OnInit {

  private phone: String = ''
  private password: String = ''
  private confirmPassword: String = ''
  private name: String = ''
  private generalAddress: String = ''
  private detailAddress: String = ''

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private loading: LoadingService,
    private popup: PopupService,
    private router: Router
  ){ }

  ngOnInit() {
  }

  isValid() {
    let message = "invalid"
    if (!this.phone) {
      message += " phone"
    }

    if (!this.password) {
      message += " password"
    }

    if (!this.name) {
      message += " name"
    }

    if (!this.confirmPassword) {
      message += " confirmPassword"
    }

    if (!this.generalAddress) {
      message += " generalAddress"
    }

    if (!this.detailAddress) {
      message += " detailAddress"
    }

    return message
  }

  regist() {
    const message = this.isValid();
    if (message !== 'invalid') {
      this.popup.showError(message)
      return
    }
    const {phone, password, generalAddress, name, detailAddress} = this
    const role = 4
    this.userService.regist({phone, password, generalAddress, name, role, detailAddress}).subscribe(success => {
      this.popup.showSuccess()
    }, error => {
      this.popup.showError(error)
    })
  }

  initValidate() {

    $('#sign_up').validate({
        rules: {
            'terms': {
                required: true
            },
            'confirm': {
                equalTo: '[name="password"]'
            }
        },
        highlight: function (input) {
            $(input).parents('.form-line').addClass('error');
        },
        unhighlight: function (input) {
            $(input).parents('.form-line').removeClass('error');
        },
        errorPlacement: function (error, element) {
            $(element).parents('.input-group').append(error);
            $(element).parents('.form-group').append(error);
        }
    });
  }
}
