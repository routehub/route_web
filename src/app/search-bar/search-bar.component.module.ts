import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SearchBarComponent } from './search-bar.component';

import {MdcSliderModule} from '@angular-mdc/web';

const routes: Routes = [
    {
        path: '',
        component: SearchBarComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        MdcSliderModule
    ],
    exports: [
        SearchBarComponent
    ],
    declarations: [SearchBarComponent]
})
export class SearchBarComponentModule {}
