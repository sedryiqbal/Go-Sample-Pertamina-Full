import type { SelectProps } from 'antd';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import {
  getProductTypes,
  getShips,
  getTanks,
  getUnits,
} from '@/services/sample-estimations/api';
import type {
  ProductType,
  ShipReference,
  TankReference,
  UnitReference,
} from '@/services/sample-estimations/typings';

const mapToSelectOption = (label?: string | null, value?: unknown) => ({
  label: label ?? 'Tidak diketahui',
  value,
});

const buildProductOptions = (items: ProductType[]): SelectProps['options'] =>
  items
    .filter((item) => typeof item.id === 'number')
    .map((item) => mapToSelectOption(item.name, item.id));

const buildShipOptions = (items: ShipReference[]): SelectProps['options'] =>
  items
    .filter((item) => typeof item.id === 'number')
    .map((item) =>
      mapToSelectOption(
        item.kodeKapal
          ? `${item.namaKapal} (${item.kodeKapal})`
          : item.namaKapal,
        item.id,
      ),
    );

const buildTankOptions = (items: TankReference[]): SelectProps['options'] =>
  items
    .filter((item) => typeof item.id === 'number')
    .map((item) => mapToSelectOption(item.name, item.id));

const buildUnitOptions = (items: UnitReference[]): SelectProps['options'] =>
  items
    .filter((item) => typeof item.id === 'number')
    .map((item) => mapToSelectOption(item.name, item.id));

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Terjadi kesalahan pada sistem';
};

export interface ReferenceDataResult {
  loading: boolean;
  productTypes: ProductType[];
  shipReferences: ShipReference[];
  tankReferences: TankReference[];
  unitReferences: UnitReference[];
  productOptions: SelectProps['options'];
  shipOptions: SelectProps['options'];
  tankOptions: SelectProps['options'];
  unitOptions: SelectProps['options'];
  refresh: () => Promise<void>;
}

export const useReferenceData = (): ReferenceDataResult => {
  const [loading, setLoading] = useState(false);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [shipReferences, setShipReferences] = useState<ShipReference[]>([]);
  const [tankReferences, setTankReferences] = useState<TankReference[]>([]);
  const [unitReferences, setUnitReferences] = useState<UnitReference[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [typeLoadList, shipList, tankList, unitList] = await Promise.all([
        getProductTypes(),
        getShips(),
        getTanks(),
        getUnits(),
      ]);

      setProductTypes(typeLoadList);
      setShipReferences(shipList);
      setTankReferences(tankList);
      setUnitReferences(unitList);
    } catch (error) {
      message.error(`Gagal memuat data referensi: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return {
    loading,
    productTypes,
    shipReferences,
    tankReferences,
    unitReferences,
    productOptions: buildProductOptions(productTypes),
    shipOptions: buildShipOptions(shipReferences),
    tankOptions: buildTankOptions(tankReferences),
    unitOptions: buildUnitOptions(unitReferences),
    refresh: loadData,
  };
};
