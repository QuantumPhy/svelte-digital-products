<script lang="ts">
 import {tableFeatures,rowSortingFeature,createSortedRowModel,sortFn_text,columnFilteringFeature,createFilteredRowModel,filterFn_includesString,rowSelectionFeature,type ColumnDef,type SortingState}from'@tanstack/table-core';
 import {createSvelteTable,FlexRender,renderComponent,renderSnippet}from'../../src/lib/components/ui/data-table/index.js';
 import AmountCell from './AmountCell.svelte';
 type Person={id:string;name:string;amount:number};
 let people=$state<Person[]>([{id:'bravo',name:'Bravo',amount:20},{id:'alpha',name:'Alpha',amount:10},{id:'charlie',name:'Charlie',amount:30}]);
 let sorting=$state<SortingState>([]);
 let header=$state('Name');
 const features=tableFeatures({rowSortingFeature,sortedRowModel:createSortedRowModel(),sortFns:{text:sortFn_text},columnFilteringFeature,filteredRowModel:createFilteredRowModel(),filterFns:{includesString:filterFn_includesString},rowSelectionFeature});
 const columns=$derived<ColumnDef<typeof features,Person>[]>([
  {accessorKey:'name',header,sortFn:'text',filterFn:'includesString',cell:info=>renderSnippet(nameCell,{name:info.row.original.name})},
  {accessorKey:'amount',header:'Amount',cell:info=>renderComponent(AmountCell,{amount:info.row.original.amount})}
 ]);
 const table=createSvelteTable({features,get data(){return people},get columns(){return columns},getRowId:row=>row.id,state:{get sorting(){return sorting}},onSortingChange:updater=>{sorting=typeof updater==='function'?updater(sorting):updater;}});
 const selection=$derived(Object.keys(table.atoms.rowSelection.get()).filter(id=>table.atoms.rowSelection.get()[id]).sort().join(','));
 function replace(){people=[{id:'delta',name:'Delta',amount:40},{id:'alpha',name:'Aster',amount:11}];}
</script>
{#snippet nameCell({name}:{name:string})}<strong data-cell="name">{name}</strong>{/snippet}
<h1>Table adapter integration fixture</h1>
<button onclick={()=>table.setSorting([{id:'name',desc:false}])}>Sort ascending</button>
<button onclick={()=>table.setSorting([{id:'name',desc:true}])}>Sort descending</button>
<button onclick={()=>{sorting=[{id:'name',desc:true}]}}>External descending</button>
<button onclick={()=>table.setSorting([])}>Clear sorting</button>
<label>Filter name<input oninput={e=>table.getColumn('name')?.setFilterValue(e.currentTarget.value)} /></label>
<button onclick={replace}>Replace data</button>
<button onclick={()=>header='Person'}>Rename header</button>
<button onclick={()=>table.resetRowSelection()}>Clear selection</button>
<output aria-label="Selected rows">{selection||'none'}</output>
<table>
 <thead>{#each table.getHeaderGroups()as group(group.id)}<tr><th scope="col">Select</th>{#each group.headers as h(h.id)}<th scope="col"><FlexRender content={h.column.columnDef.header} context={h.getContext()}/></th>{/each}</tr>{/each}</thead>
 <tbody>{#each table.getRowModel().rows as row(row.id)}<tr data-row={row.id}><td><input type="checkbox" aria-label={'Select '+row.original.name} checked={row.getIsSelected()} onchange={e=>row.toggleSelected(e.currentTarget.checked)}/></td>{#each row.getAllCells()as cell(cell.id)}<td><FlexRender content={cell.column.columnDef.cell} context={cell.getContext()}/></td>{/each}</tr>{/each}</tbody>
</table>
