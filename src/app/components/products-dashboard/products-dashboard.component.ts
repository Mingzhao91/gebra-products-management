import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';

import { Product } from '../../interfaces/product';
import { ProductsService } from '../../services/products.service';
import { UtilsService } from '../../services/utils.service';
import { PRODUCTS } from '../../constants/excel';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';

@Component({
  selector: 'app-products-dashboard',
  standalone: true,
  imports: [
    // angular modules
    CommonModule,
    FormsModule,
    // angular material modules
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    // components
    ProductDialogComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './products-dashboard.component.html',
  styleUrl: './products-dashboard.component.scss',
})
export class ProductsDashboardComponent {
  products: Product[] = [];
  // table variables
  displayedColumns: string[] = [
    'select',
    'pictureUrl',
    'modelNumber',
    'category',
    'capacity',
    'prices',
    'description',
  ];
  dataSource!: MatTableDataSource<Product>;
  selection = new SelectionModel<Product>(true, []);
  isDownloading = false;
  validDate!: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private productService: ProductsService,
    public utilsService: UtilsService
  ) {}

  async ngOnInit() {
    // Get products from server
    // TODO: uncomment // await this.productService.getProducts();
    this.products = PRODUCTS;

    // set products in table
    this.dataSource = new MatTableDataSource(this.products);

    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // selection
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);

    console.log('this.selection.selected:');
    console.log(this.selection.selected);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }

  async exportExcelButtonOnClick() {
    if (
      this.selection.selected &&
      this.selection.selected.length > 0 &&
      this.validDate
    ) {
      this.isDownloading = true;
      await this.utilsService.exportExcel(
        this.selection.selected,
        this.validDate,
        'products'
      );
      this.isDownloading = false;
    }
  }

  addProductButtonOnClick() {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      data: {
        product: null,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('result: ', result);
    });
  }
}
