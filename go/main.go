package main

import (
	"bytes"
	"syscall/js"
	"unsafe"

	"github.com/xuri/excelize/v2"
)

type value struct {
	ref uint32
}

type jsExcelApi struct {
	client    js.Value
	ch        chan bool
	excelFile *excelize.File
}

func main() {
	api := createJSApi()
	api.client.Set("loadExcel", js.FuncOf(api.loadExcel))
	api.client.Set("getCellValue", js.FuncOf(api.getCellValue))
	api.client.Set("setCellValue", js.FuncOf(api.setCellValue))
	api.client.Set("getExcel", js.FuncOf(api.getExcel))
	api.client.Set("getExcelSize", js.FuncOf(api.getExcelSize))

	<-api.ch
}

func createJSApi() *jsExcelApi {
	jsObject := js.ValueOf(map[string]interface{}{})
	pnt := (*value)(unsafe.Pointer(&jsObject))
	pnt.ref = 6
	ctx := (*js.Value)(unsafe.Pointer(pnt))

	api := &jsExcelApi{ch: make(chan bool), client: ctx.Get("_client"), excelFile: excelize.NewFile()}

	api.client.Set("dispose", js.FuncOf(api.dispose))

	return api
}

func (api *jsExcelApi) dispose(this js.Value, args []js.Value) interface{} {
	api.ch <- true

	return nil
}

func (api *jsExcelApi) loadExcel(this js.Value, args []js.Value) interface{} {
	jsBuf := args[0]
	size := args[1]

	buf := make([]byte, size.Int())
	js.CopyBytesToGo(buf, jsBuf)
	f, _ := excelize.OpenReader(bytes.NewReader(buf))

	api.excelFile = f

	return nil
}

func (api *jsExcelApi) getCellValue(this js.Value, args []js.Value) interface{} {
	sheet := args[0]
	cell := args[1]

	value, _ := api.excelFile.GetCellValue(sheet.String(), cell.String())

	return value
}

func (api *jsExcelApi) setCellValue(this js.Value, args []js.Value) interface{} {
	sheet := args[0]
	cell := args[1]
	value := args[2]

	err := api.excelFile.SetCellValue(sheet.String(), cell.String(), value.String())

	return err == nil
}

func (api *jsExcelApi) getExcelSize(this js.Value, args []js.Value) interface{} {
	buf, _ := api.excelFile.WriteToBuffer()

	return buf.Len()
}

func (api *jsExcelApi) getExcel(this js.Value, args []js.Value) interface{} {
	jsBuf := args[0]
	buf, _ := api.excelFile.WriteToBuffer()

	js.CopyBytesToJS(jsBuf, buf.Bytes())

	return nil
}
