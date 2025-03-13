import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormChildComponent } from './components/form-child/form-child.component';
import { toSignal } from '@angular/core/rxjs-interop'
export interface ItemForm {
  id: FormControl<number>,
  name: FormControl<string>,
  value: FormControl<number>
}

export type CustomFormGroup = FormGroup<ItemForm>
@Component({
  selector: 'app-root',
  imports: [ ReactiveFormsModule, FormChildComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Old way
  // form: FormGroup<{ items: FormArray<FormGroup<ItemForm>>}>;
  // constructor(private fb: FormBuilder){
  //   this.form = fb.group({
  //     items: fb.array<FormGroup<ItemForm>>([])
  //   })
  // }

  // New way
  formBuilder = inject(NonNullableFormBuilder);
  customForm: FormGroup<{ items: FormArray<CustomFormGroup>}> = this.formBuilder.group({
    items: this.formBuilder.array<CustomFormGroup>([])
  })

  get items() {
    return this.customForm.controls.items
  }

  itemsChanges = toSignal(this.customForm.valueChanges)

  totalValue = computed( () => {
    const value = this.itemsChanges()?.items?.reduce( (total, item) => total + Number(item?.value) || 0, 0);
    return value;
  })

  addItem() {
    const id = this.items.length + 1;
    const itemForm = this.formBuilder.group<ItemForm>({
      id: this.formBuilder.control(id),
      name: this.formBuilder.control('', { validators: [Validators.required]}),
      value: this.formBuilder.control(0, { validators: [Validators.required]}),
    });

    this.customForm.controls.items.push(itemForm);
  }
}
